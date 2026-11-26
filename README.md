# Jólaorðaleit

Íslensk jólaorðaleit fyrir Jólahornið. Tíu orð eru falin í 10×10 stafaneti á hverjum degi 1.–24. desember. Dagsetning miðar við íslenskan tíma. Prufuþraut er opin fram að 1. desember. Þraut aðfangadags er áfram opin út desember.

Tíminn fer af stað við fyrsta val og stöðvast þegar öll orðin eru fundin. Staða dagsins vistast í vafranum. Opnirðu þrautina aftur áður en henni lýkur heldur tímamælirinn áfram frá upphafstímanum.

## Keyra staðbundið

Keyrðu eftirfarandi í rót verkefnisins og opnaðu <http://localhost:8000>.

```sh
python3 -m http.server 8000
```

Til að prófa tiltekna desemberþraut má bæta `?previewDate=2026-12-03` við slóðina. Staða prufuþrautar, forskoðunar og daglegrar þrautar er vistuð undir aðskildum lyklum í vafranum. Þemun og orðalistarnir eru í `puzzles.mjs`.

## Birting

Í **Settings → Pages** skal velja **GitHub Actions** sem birtingaraðferð. Vinnuflæðið í `.github/workflows/deploy.yml` birtir vefinn þegar breytingar fara í `main`.

Vefslóð eftir birtingu er <https://aron5109.github.io/jolaordaleit/>.

Leturgerðirnar EB Garamond og IBM Plex Sans fylgja vefnum. SIL Open Font License fylgir hvorri leturgerð í `assets/`.
