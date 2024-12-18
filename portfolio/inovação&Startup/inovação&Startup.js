(function redirectIfNotLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redireciona para a página de login
        window.location.href = '../index.html';
    }
})();

const dataUrl = '../../files/Inovacao_e_Startup.json';
let tableData = [];
let currentPage = 1;
const itemsPerPage = 25;
let filteredData = []; // Dados filtrados para exibição
let selectedFilters = { area: [], subArea: [], portfolio: [] }; // Filtros selecionados
let searchQuery = ""; // Consulta da barra de busca

// Sidebar Toggle
document.addEventListener("DOMContentLoaded", () => {
    // Carregar o menu lateral
    fetch("../../menu/menu.html")
        .then(response => response.text())
        .then(menuHtml => {
            const menuContainer = document.createElement("div");
            menuContainer.innerHTML = menuHtml;
            document.body.insertBefore(menuContainer.firstElementChild, document.body.firstChild);

            // Inicializar interações após carregar o menu
            initializeSidebar();
        })
        .catch(error => console.error("Erro ao carregar o menu:", error));
});
function initializeSidebar() {
    const toggleSidebarButton = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    if (toggleSidebarButton) {
        toggleSidebarButton.addEventListener("click", () => {
            sidebar.classList.toggle("expanded");
            sidebar.classList.toggle("minimized");
            mainContent.classList.toggle("minimized");

            const isMinimized = sidebar.classList.contains("minimized");
            localStorage.setItem("sidebarState", isMinimized ? "minimized" : "expanded");
        });
    }

    const savedState = localStorage.getItem("sidebarState");
    if (savedState === "minimized") {
        sidebar.classList.add("minimized");
        sidebar.classList.remove("expanded");
        mainContent.classList.add("minimized");
    } else {
        sidebar.classList.add("expanded");
        sidebar.classList.remove("minimized");
        mainContent.classList.remove("minimized");
    }
}


// Load Data
async function loadData() {
    try {
        const response = await fetch(dataUrl);
        tableData = await response.json();
        filteredData = [...tableData]; // Inicializa os dados filtrados com todos os dados
        renderTable();
        updatePaginationInfo();
        renderFilterOptions(); // Renderiza os filtros ao carregar os dados
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

// Render Table
function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentData = filteredData.slice(start, end);

    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    // Render Headers
    if (!tableHeader.innerHTML) {
        const headers = Object.keys(tableData[0]);
        const headerMapping = {
       
        };

        headers.forEach(header => {
            const th = document.createElement('th');
            th.innerHTML = headerMapping[header] || header;
            tableHeader.appendChild(th);
        });
    }

    // Render Rows
    tableBody.innerHTML = '';
    if (currentData.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = Object.keys(tableData[0]).length;
        td.textContent = "Nenhum dado encontrado.";
        td.className = "text-center";
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }

    currentData.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            td.title = value; // Tooltip para texto completo
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Update Pagination Info
function updatePaginationInfo() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('paginationInfo').textContent =
        `Página ${currentPage} de ${totalPages} - ${totalItems} itens`;
}

// Render Filter Options
function renderFilterOptions() {
    updateFilterOptions(); // Atualiza as opções com base nos filtros selecionados
}

// Atualiza opções de filtro com base nos dados selecionados
function updateFilterOptions() {
    // Considera todos os dados originais ao recalcular os filtros
    const dataToFilter = tableData.filter(row => {
        return (
            (selectedFilters.area.length === 0 || selectedFilters.area.includes(row['Temas'])) &&
            (selectedFilters.subArea.length === 0 || selectedFilters.subArea.includes(row['Subtemas'])) &&
            (selectedFilters.portfolio.length === 0 || selectedFilters.portfolio.includes(row['Instrumento']))
        );
    });

    const areas = [...new Set(tableData.map(item => item['Temas']))];
    const subAreas = [...new Set(dataToFilter.map(item => item['Subtemas']))];
    const portfolios = [...new Set(dataToFilter.map(item => item['Instrumento']))];

    renderCheckboxes('filterArea', areas, 'area');
    renderCheckboxes('filterSubArea', subAreas, 'subArea');
    renderCheckboxes('filterPortfolio', portfolios, 'portfolio');
}

// Renderiza checkboxes para os filtros
function renderCheckboxes(containerId, items, filterType) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = '<p class="text-muted">Nenhum item disponível</p>';
        return;
    }

    items.forEach(item => {
        const label = document.createElement('label');
        label.className = 'd-block';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item;

        // Mantém o estado dos itens já selecionados
        checkbox.checked = selectedFilters[filterType].includes(item);

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!selectedFilters[filterType].includes(item)) {
                    selectedFilters[filterType].push(item);
                }
            } else {
                selectedFilters[filterType] = selectedFilters[filterType].filter(value => value !== item);
            }

            // Atualiza a exibição dos filtros selecionados
            updateSelectedFiltersDisplay();

            // Atualiza as opções subsequentes de forma dependente
            updateFilterOptions();

            // Garante que os itens selecionados permaneçam visíveis
            renderCheckboxes(containerId, [...new Set([...items, ...selectedFilters[filterType]])], filterType);
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + item));
        container.appendChild(label);
    });
}

// Função auxiliar para manter a exibição dos filtros selecionados
function updateSelectedFiltersDisplay() {
    const selectedContainer = document.getElementById('selectedFilters');
    selectedContainer.innerHTML = '';

    Object.keys(selectedFilters).forEach(type => {
        selectedFilters[type].forEach(filter => {
            const span = document.createElement('span');
            span.textContent = filter;
            span.className = 'badge bg-secondary m-1';
            selectedContainer.appendChild(span);
        });
    });
}
document.getElementById('applyFilters').addEventListener('click', () => {
    applyFilters(); // Atualiza os dados filtrados
    currentPage = 1; // Volta para a primeira página
    const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    modal.hide(); // Fecha o modal de filtros
});

// Aplica os filtros na tabela
function applyFilters() {
    filteredData = tableData.filter(row => {
        // Verifica se cada filtro corresponde ao valor da linha
        const matchesArea = selectedFilters.area.length === 0 || selectedFilters.area.includes(row['Temas']);
        const matchesSubArea = selectedFilters.subArea.length === 0 || selectedFilters.subArea.includes(row['Subtemas']);
        const matchesPortfolio = selectedFilters.portfolio.length === 0 || selectedFilters.portfolio.includes(row['Instrumento']);
        const matchesSearch = Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchQuery)
        );

        return matchesSearch && matchesArea && matchesSubArea && matchesPortfolio;
    });

    // Atualiza a tabela e a paginação
    renderTable();
    updatePaginationInfo();
}

// Botão Cancelar - Remove filtros
document.getElementById('cancelFilters').addEventListener('click', () => {
    selectedFilters = { area: [], subArea: [], portfolio: [] }; // Reseta os filtros
    searchQuery = ""; // Limpa a barra de busca
    filteredData = [...tableData]; // Restaura os dados completos

    // Atualiza as opções de filtro para mostrar todos os itens novamente
    updateFilterOptions();
    updateSelectedFiltersDisplay(); // Limpa a exibição dos filtros selecionados
    renderTable(); // Atualiza a tabela
    updatePaginationInfo(); // Atualiza a paginação

    const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    modal.hide(); // Fecha o modal
});


// Barra de Busca
document.getElementById('searchBar').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
});

// Paginação
document.getElementById('firstPage').addEventListener('click', () => {
    currentPage = 1;
    renderTable();
    updatePaginationInfo();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePaginationInfo();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updatePaginationInfo();
    }
});

document.getElementById('lastPage').addEventListener('click', () => {
    currentPage = Math.ceil(filteredData.length / itemsPerPage);
    renderTable();
    updatePaginationInfo();
});

document.addEventListener('DOMContentLoaded', async () => {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = true; // Desabilita o botão inicialmente

    try {
        await loadData(); // Garante que os dados sejam carregados antes de habilitar o botão
        downloadBtn.disabled = false; // Habilita o botão após carregar os dados
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        alert('Erro ao carregar os dados. O botão de download permanecerá desabilitado.');
    }
});
// Adicionar evento ao botão de download
document.getElementById('downloadBtn').addEventListener('click', async () => {
    try {
        if (!window.ExcelJS) {
            await loadExcelJSLibrary(); // Garante que a biblioteca ExcelJS esteja carregada
        }

        if (!filteredData || !filteredData.length) {
            alert('Nenhum dado disponível para exportar.');
            return;
        }

        await exportToExcel(filteredData, 'inovacao&Startup.xlsx');
    } catch (error) {
        console.error('Erro ao tentar exportar os dados:', error);
        alert('Erro ao tentar exportar os dados. Por favor, tente novamente.');
    }
});

async function loadExcelJSLibrary() {
    if (!window.ExcelJS) {
        try {
            await import('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');
            console.log('Biblioteca ExcelJS carregada com sucesso.');
        } catch (error) {
            console.error('Erro ao carregar a biblioteca ExcelJS:', error);
            alert('Erro ao carregar a biblioteca ExcelJS. Por favor, tente novamente.');
            throw error;
        }
    }
}

async function exportToExcel(data, filename) {
    try {
        const ExcelJS = window.ExcelJS;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tabela');

        // Adiciona os cabeçalhos
        const headers = Object.keys(data[0]);
        const headerRow = worksheet.addRow(headers);

        // Estilo dos cabeçalhos
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' },
            };
            cell.alignment = { horizontal: 'center' };
        });

        // Adiciona os dados
        data.forEach(row => {
            const rowValues = headers.map(header => row[header] || '');
            worksheet.addRow(rowValues);
        });

        // Estilo zebra para as linhas
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {
                            argb: rowNumber % 2 === 0 ? 'FFD9E1F2' : 'FFFFFFFF',
                        },
                    };
                    cell.alignment = { horizontal: 'center' };
                });
            }
        });

        // Configura largura automática para as colunas
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const value = cell.value ? cell.value.toString() : '';
                maxLength = Math.max(maxLength, value.length);
            });
            column.width = maxLength + 2;
        });

        // Salva o arquivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Gera o download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Arquivo gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        throw error;
    }
}
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const submenu = item.nextElementSibling;
        submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    });
});


// Carregar dados e inicializar
loadData();
