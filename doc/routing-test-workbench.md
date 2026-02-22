# Routing Test Workbench

Diese Arbeitsumgebung ermoeglicht reproduzierbare Tests fuer Dashboard-Routing ohne Brille.

## Standard-Checks

```bash
npm --prefix testapp run build
npm --prefix testapp run test
```

Gezielter Dashboard-Lauf:

```bash
npm --prefix testapp run test:dashboard
```

## Reale EvenHub-Payloads erweitern

1. Neue Event-Variante in `testapp/src/screens/dashboard/__fixtures__/dashboardInputEvents.ts` anlegen.
2. Erwartetes Routing in `testapp/src/screens/dashboard/resolveDashboardSelection.test.ts` als Testfall ergaenzen.
3. `npm --prefix testapp run test:dashboard` ausfuehren.

Damit werden neue Device-/Simulator-Payloads direkt regressionssicher.
