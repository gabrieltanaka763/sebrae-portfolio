const dataUrl = './tabela_area.json';
let tableData = [];
let currentPage = 1;
const itemsPerPage = 25;
let filteredData = []; // Dados filtrados para exibição
let selectedFilters = { area: [], subArea: [], portfolio: [] }; // Filtros selecionados
let searchQuery = ""; // Consulta da barra de busca

// Sidebar Toggle
document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    sidebar.classList.toggle('expanded');
    sidebar.classList.toggle('minimized');
    mainContent.classList.toggle('minimized');
});

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
            "CÓD. CONTRATAÇÃO SGF": "CÓD. SGF",
            "NATUREZA DA PRESTAÇÃO DE SERVIÇO": "NATUREZA",
            "FORMA DA PRESTAÇÃO DO SERVIÇO": "FORMA",
            "NOME DO PORTFOLIO": "PORTFOLIO",
            "FORMA DE CONTRATAÇÃO": "FORMATO DE<br>CONTRATAÇÃO"
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
    const dataToFilter = tableData.filter(row => {
        return (
            (selectedFilters.area.length === 0 || selectedFilters.area.includes(row['ÁREA'])) &&
            (selectedFilters.subArea.length === 0 || selectedFilters.subArea.includes(row['SUBÁREA'])) &&
            (selectedFilters.portfolio.length === 0 || selectedFilters.portfolio.includes(row['NOME DO PORTFOLIO']))
        );
    });

    const areas = [...new Set(tableData.map(item => item['ÁREA']))];
    const subAreas = [...new Set(dataToFilter.map(item => item['SUBÁREA']))];
    const portfolios = [...new Set(dataToFilter.map(item => item['NOME DO PORTFOLIO']))];

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
        const matchesArea = selectedFilters.area.length === 0 || selectedFilters.area.includes(row['ÁREA']);
        const matchesSubArea = selectedFilters.subArea.length === 0 || selectedFilters.subArea.includes(row['SUBÁREA']);
        const matchesPortfolio = selectedFilters.portfolio.length === 0 || selectedFilters.portfolio.includes(row['NOME DO PORTFOLIO']);
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

    // Redefine os checkboxes no modal
    document.querySelectorAll('#filterArea input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('#filterSubArea input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('#filterPortfolio input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);

    updateSelectedFiltersDisplay(); // Limpa os filtros selecionados exibidos no modal
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

// Carregar dados e inicializar
loadData();
