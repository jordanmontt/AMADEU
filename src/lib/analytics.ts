/**
 * Visit counting with GoatCounter (RF-62, ADR 0025, ADR 0056): no cookies, no consent
 * banner, a public dashboard. Off until the Foundation's site code is configured
 * (PUBLIC_GOATCOUNTER_CODE at build time).
 */

const SITE_CODE = /^[a-z0-9-]{2,50}$/;

export interface GoatCounter {
  /** Where the counter script sends visits. */
  readonly endpoint: string;
  /** The public dashboard, linked from the footer. */
  readonly dashboard: string;
}

/** GoatCounter's addresses for a site code; nothing when no code is configured. */
export function goatCounter(code: string | undefined): GoatCounter | undefined {
  if (code === undefined || code === '') {
    return undefined;
  }
  if (!SITE_CODE.test(code)) {
    throw new Error(`PUBLIC_GOATCOUNTER_CODE "${code}" is not a GoatCounter site code`);
  }
  return {
    endpoint: `https://${code}.goatcounter.com/count`,
    dashboard: `https://${code}.goatcounter.com/`,
  };
}
