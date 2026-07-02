import hashlib
import hmac
import json

import requests
from django.conf import settings
from django.utils import timezone

from .models import AuditLog, WebhookDelivery

WEBHOOK_TIMEOUT_SECONDS = 3


def record_action(action, actor, asset, details=None):
    """Create an AuditLog entry for an asset event, then attempt to notify the SOC dashboard."""
    log = AuditLog.objects.create(
        action=action,
        actor=actor,
        asset_tag=asset.asset_tag,
        asset_name=asset.name,
        details=details or {},
    )
    _dispatch_webhook(log)
    return log


def _sign_payload(payload_bytes):
    return hmac.new(
        settings.SOC_WEBHOOK_SECRET.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()


def _dispatch_webhook(log):
    if not settings.SOC_WEBHOOK_URL:
        return

    payload = {
        'source': 'asset-management',
        'action': log.action,
        'asset_tag': log.asset_tag,
        'asset_name': log.asset_name,
        'actor': log.actor.username if log.actor else None,
        'details': log.details,
        'timestamp': timezone.now().isoformat(),
    }
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode()
    headers = {'Content-Type': 'application/json'}
    if settings.SOC_WEBHOOK_SECRET:
        headers['X-Signature'] = _sign_payload(payload_bytes)

    delivery = WebhookDelivery.objects.create(audit_log=log, status=WebhookDelivery.Status.PENDING)
    try:
        response = requests.post(
            settings.SOC_WEBHOOK_URL,
            data=payload_bytes,
            headers=headers,
            timeout=WEBHOOK_TIMEOUT_SECONDS,
        )
        delivery.response_code = response.status_code
        delivery.status = (
            WebhookDelivery.Status.SUCCESS if response.ok else WebhookDelivery.Status.FAILED
        )
        if not response.ok:
            delivery.error_message = response.text[:500]
    except requests.RequestException as exc:
        delivery.status = WebhookDelivery.Status.FAILED
        delivery.error_message = str(exc)[:500]
    delivery.save()
