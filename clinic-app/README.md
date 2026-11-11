# Fatty Liver Clinic (desktop app)

A clinic tool for the complete evaluation of MASLD, MASH and suspected patients.
It follows the classic clinical sheet (personal history, complaint, present illness, past and drug
history, special habits, family history, examination, laboratory, imaging), calculates every score
automatically, suggests a guideline-based assessment and plan, prints the final medical report as a PDF,
and keeps every patient as a file on your desktop for the MASLD registry.

Nothing leaves the computer. There is no server and no account.

## Install

Download the installer from the repository's **Releases** page:

- Windows: `FattyLiverClinic-<version>-win-x64.exe` (double-click, Next, Finish).
  Windows SmartScreen may warn because the app is not code-signed: click "More info" then "Run anyway".
- Mac: `FattyLiverClinic-<version>-mac-arm64.dmg` (Apple silicon) or `-mac-x64.dmg` (Intel).
  The app is not notarised: on first launch, right-click the app, choose **Open**, then **Open** again.
  If macOS still refuses, run `xattr -dr com.apple.quarantine "/Applications/Fatty Liver Clinic.app"` in Terminal.

## Where the data lives

Default data folder: `Documents/Fatty Liver Clinic/`

| Folder | Contents |
| --- | --- |
| `patients/` | one JSON file per patient, all visits inside |
| `reports/` | the PDF reports you export |
| `exports/` | registry CSV exports |
| `trash/` | deleted patients (nothing is destroyed) |

Back up the whole folder (copy it to a USB stick or cloud drive). To move to another computer, copy the
folder and point the app to it in **Settings → Change folder**.

## Daily use

1. **New patient**: fill the Personal tab (name and sex are required), then the sheet in order.
2. **Laboratory**: choose Conventional (mg/dL) or SI (mmol/L) at the top; switching converts entered values.
   H and L flags show results outside the reference range.
3. The right-hand panel shows the live assessment (BMI, cardiometabolic criteria, FIB-4, stiffness, Agile, FAST, fibrosis risk, suggested diagnosis).
4. **Assessment & plan**: the suggested diagnosis, ICD-10 codes, fibrosis stage, other causes to exclude and a
   grouped list of recommendations. Edit, untick or add items; they are what the report prints.
5. **Report**: preview, then **Export PDF** or **Print**.
6. **New visit** creates a follow-up visit and copies the past, drug, habits and family history from the previous one.
7. **Export registry (CSV)** writes one row per visit with demographics, labs, scores, stage and diagnosis; it opens in Excel.

Autosave runs after every change; Ctrl+S saves immediately.

## Scores and rules

FIB-4, NFS, APRI, ELF bands, FLI, HSI, HOMA-IR, Agile 3+, Agile 4, FAST, liver stiffness and CAP bands,
MRE bands, Baveno VII varices rule, Child-Pugh, MELD 3.0, eGFR (CKD-EPI 2021), AUDIT-C, pack-years,
alcohol class (MASLD / MetALD / ALD) and the five cardiometabolic criteria.
Formulas and cut-offs are the same as the Metabolic Liver Academy calculators; see `app/calc.js`.
The assessment rules (`app/rules.js`) follow EASL–EASD–EASO 2024, AASLD 2023/2024, Baveno VII and the
Delphi 2023 nomenclature. They support, but never replace, clinical judgement.

## Develop

```bash
cd clinic-app
npm install
npm start          # run the app
npm test           # calculator and rules tests
npm run dist:win   # Windows installer (run on Windows)
npm run dist:mac   # Mac disk images (run on a Mac)
```

The GitHub workflow `.github/workflows/clinic-app.yml` builds both installers on every change to
`clinic-app/` and publishes them as a release when a tag `clinic-v*` is pushed:

```bash
git tag clinic-v1.0.0
git push origin clinic-v1.0.0
```

Set the version in `clinic-app/package.json` before tagging.
