export const defaultTemplates = [
    {
        id: 'shift-assignment',
        name: 'Schichtzuweisung',
        subject: 'Neue Schicht zugewiesen',
        body: `Hallo {mitarbeiterName},

Eine neue Schicht wurde Ihnen zugewiesen:

Datum: {datum}
Zeit: {zeit}
Filiale: {filiale}

Bitte bestätigen Sie die Schicht über das Portal.

Mit freundlichen Grüßen
{managerName}`,
        variables: ['mitarbeiterName', 'datum', 'zeit', 'filiale', 'managerName']
    },
    {
        id: 'shift-change',
        name: 'Schichtänderung',
        subject: 'Änderung Ihrer Schicht',
        body: `Hallo {mitarbeiterName},

Ihre Schicht wurde geändert:

Alt:
Datum: {altDatum}
Zeit: {altZeit}

Neu:
Datum: {neuDatum}
Zeit: {neuZeit}
Filiale: {filiale}

Bitte bestätigen Sie die Änderung über das Portal.

Mit freundlichen Grüßen
{managerName}`,
        variables: ['mitarbeiterName', 'altDatum', 'altZeit', 'neuDatum', 'neuZeit', 'filiale', 'managerName']
    }
];
