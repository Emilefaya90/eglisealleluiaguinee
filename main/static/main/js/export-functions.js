// ===== FONCTIONNALITÉS D'EXPORTATION ET D'IMPRESSION =====

document.addEventListener('DOMContentLoaded', function() {
    
    // Fonction pour exporter en Excel
    document.getElementById('exportExcelBtn')?.addEventListener('click', function() {
        try {
            const table = document.getElementById('eglisesTable') || document.querySelector('table');
            if (!table) {
                alert('Tableau non trouvé');
                return;
            }
            
            // Utiliser SheetJS pour l'export Excel
            const wb = XLSX.utils.table_to_book(table, {sheet: 'Églises'});
            const fileName = 'Églises_enregistrées_' + new Date().toISOString().split('T')[0] + '.xlsx';
            XLSX.writeFile(wb, fileName);
            
            showNotification('Export Excel réussi !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            alert('Erreur lors de l\'export Excel: ' + error.message);
        }
    });
    
    // Fonction pour exporter en PDF
    document.getElementById('exportPdfBtn')?.addEventListener('click', function() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Titre du document
            doc.setFontSize(16);
            doc.text('Églises Enregistrées', 14, 20);
            doc.setFontSize(10);
            doc.text('Exporté le: ' + new Date().toLocaleDateString('fr-FR'), 14, 30);
            
            // Récupérer les données du tableau
            const table = document.getElementById('eglisesTable') || document.querySelector('table');
            if (!table) {
                alert('Tableau non trouvé');
                return;
            }
            
            // Extraire les en-têtes
            const headers = [];
            const headerCells = table.querySelectorAll('thead th');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });
            
            // Extraire les données
            const data = [];
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                data.push(rowData);
            });
            
            // Générer le tableau PDF
            doc.autoTable({
                head: [headers],
                body: data,
                startY: 40,
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [52, 58, 64],
                    textColor: 255
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250]
                }
            });
            
            // Sauvegarder le PDF
            const fileName = 'Églises_enregistrées_' + new Date().toISOString().split('T')[0] + '.pdf';
            doc.save(fileName);
            
            showNotification('Export PDF réussi !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de l\'export PDF: ' + error.message);
        }
    });
    
    // Fonction pour exporter en CSV
    document.getElementById('exportCsvBtn')?.addEventListener('click', function() {
        try {
            const table = document.getElementById('eglisesTable') || document.querySelector('table');
            if (!table) {
                alert('Tableau non trouvé');
                return;
            }
            
            let csv = [];
            
            // Extraire les en-têtes
            const headers = [];
            const headerCells = table.querySelectorAll('thead th');
            headerCells.forEach(cell => {
                headers.push('"' + cell.textContent.trim().replace(/"/g, '""') + '"');
            });
            csv.push(headers.join(','));
            
            // Extraire les données
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    rowData.push('"' + cell.textContent.trim().replace(/"/g, '""') + '"');
                });
                csv.push(rowData.join(','));
            });
            
            // Créer le fichier CSV
            const csvContent = csv.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'Églises_enregistrées_' + new Date().toISOString().split('T')[0] + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Export CSV réussi !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            alert('Erreur lors de l\'export CSV: ' + error.message);
        }
    });
    
    // Fonction pour imprimer
    document.getElementById('printBtn')?.addEventListener('click', function() {
        try {
            const table = document.getElementById('eglisesTable') || document.querySelector('table');
            if (!table) {
                alert('Tableau non trouvé');
                return;
            }
            
            // Créer une nouvelle fenêtre pour l'impression
            const printWindow = window.open('', '_blank');
            
            // Contenu HTML pour l'impression
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Églises Enregistrées</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; text-align: center; margin-bottom: 20px; }
                        .date { text-align: center; margin-bottom: 30px; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin: 0 auto; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #343a40; color: white; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f8f9fa; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Églises Enregistrées</h1>
                    <div class="date">Imprimé le: ${new Date().toLocaleDateString('fr-FR')}</div>
                    ${table.outerHTML}
                </body>
                </html>
            `;
            
            // Écrire le contenu dans la nouvelle fenêtre
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Attendre que le contenu soit chargé puis imprimer
            printWindow.onload = function() {
                printWindow.print();
                printWindow.close();
            };
            
            showNotification('Impression lancée !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            alert('Erreur lors de l\'impression: ' + error.message);
        }
    });
    
    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Ajouter au body
        document.body.appendChild(notification);
        
        // Supprimer automatiquement après 3 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
});
