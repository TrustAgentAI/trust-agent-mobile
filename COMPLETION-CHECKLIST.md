# Trust Agent Mobile - Completion Checklist

Do not stop until every item is checked.

- [ ] All Phase 0 dependencies installed (check node_modules/@livekit exists)
- [ ] app.json correctly configured (scheme, permissions, plugins)
- [ ] All screen files exist and have no import errors
- [ ] All component files exist
- [ ] All store files exist
- [ ] All hook files exist
- [ ] All lib files exist
- [ ] server/index.ts and server/livekit-token.ts exist
- [ ] agent-runtime/runtime/livekit_worker.py exists
- [ ] constants/colors.ts and constants/typography.ts exist
- [ ] `npx tsc --noEmit` exits 0
- [ ] Zero warm-tone colour violations (grep check passes)
- [ ] Zero token naming violations
- [ ] Zero AI assistant name references in code
- [ ] Expo config checks all pass
- [ ] Dev mode login works (ta_dev_preview key)
- [ ] Dashboard shows dev seed roles (CMO + Full Stack Dev)
- [ ] Session screen renders VoiceOrb
- [ ] Marketplace screen renders WebView
- [ ] Settings screen renders all sections
- [ ] Git commit made with full message
- [ ] Pushed to https://github.com/TrustAgentAI/trust-agent-mobile

If any item is unchecked: fix it. Do not stop early.

---

*Trust Agent Mobile - AgentCore LTD - Company No. 17114811*
*20 Wenlock Road, London, England, N1 7GU - trust-agent.ai*
