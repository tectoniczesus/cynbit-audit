# DNS and email fixes (EML-01 to 04)

## SPF: authorize Microsoft 365
Current: `v=spf1 include:secureserver.net -all`

Proposed (keep `secureserver.net` only if GoDaddy still sends mail; add the contact-form mail provider):
```
v=spf1 include:spf.protection.outlook.com -all
```

## DMARC: monitor, then enforce
Current: `v=DMARC1; p=none;`

Roll out in stages, reviewing aggregate reports between each:
```
_dmarc  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@cynbit.in; fo=1"                  # week 1-2
_dmarc  TXT  "v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@cynbit.in"           # then ramp pct to 100
_dmarc  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@cynbit.in; adkim=s; aspf=s"      # final
```

## DKIM (Microsoft 365)
Enable DKIM signing for the domain in the Microsoft Defender portal; it gives the exact two CNAME targets for
`selector1._domainkey` and `selector2._domainkey`. Verify:
```
dig +short CNAME selector1._domainkey.cynbit.in
dig +short CNAME selector2._domainkey.cynbit.in
```

## Hardening extras
```
dig +short CAA cynbit.in          # add a CAA record limiting which CAs may issue certificates
dig +short TXT _mta-sts.cynbit.in # optional: MTA-STS + TLS-RPT for inbound TLS enforcement
```
