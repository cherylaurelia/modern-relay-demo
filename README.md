# Omnigraph Lance cache limits (unofficial demo)

[Issue 702](https://github.com/ModernRelay/omnigraph/issues/702) reports a long-lived server growing until it is OOM-killed, and asks for a way to configure the Lance cache sizes. This page shows a patch adding `OMNIGRAPH_LANCE_INDEX_CACHE_BYTES` and `OMNIGRAPH_LANCE_METADATA_CACHE_BYTES`, with measurements of when a cap helps and when it hurts.

The patch is on [this branch](https://github.com/cherylaurelia/omnigraph/tree/fix/lance-data-cache-bytes). All numbers come from single runs on synthetic data on one Mac.

```bash
npm install
npm run build && npm run start
```

Unofficial demo by Cheryl Aurelia: not affiliated with Modern Relay.

`measurements/` holds the load scripts and the raw RSS samples behind every number on the page. They need a local `omnigraph-server` build and a generated bundle; these are working scripts, not a packaged benchmark. `drive.py` runs the one-table workload, `drive10.py` and `writer10.py` the ten-table ones.
