(function redirectIfNotLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redireciona para a página de login
        window.location.href = '../index.html';
    }
})();


document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    sidebar.classList.toggle('expanded');
    sidebar.classList.toggle('minimized');
    mainContent.classList.toggle('minimized');
});

// Configuração base para gráficos de barra (vertical)
const barChartConfig = {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Quantidade',
            data: [],
            backgroundColor: [
                '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                '#858796', '#5a5c69', '#ff9f40', '#71c9ce', '#a29bfe'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            title: { display: false }
        },
        scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
        }
    }
};

// Configuração base para gráficos de barra horizontal (Área)
const horizontalBarChartConfig = {
    ...barChartConfig,
    options: {
        ...barChartConfig.options,
        indexAxis: 'y' // Faz as barras ficarem horizontais
    }
};

// Configuração base para gráficos de pizza
const pieChartConfig = {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                '#858796', '#5a5c69', '#ff9f40', '#71c9ce', '#a29bfe'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
            title: { display: false }
        }
    }
};

// Inicialização dos gráficos
const chartArea = new Chart(document.getElementById('chartArea').getContext('2d'), horizontalBarChartConfig);
const chartSubArea = new Chart(document.getElementById('chartSubArea').getContext('2d'), barChartConfig);
const chartPortfolio = new Chart(document.getElementById('chartPortfolio').getContext('2d'), barChartConfig);
const chartObjeto = new Chart(document.getElementById('chartObjeto').getContext('2d'), barChartConfig);
const chartNatureza = new Chart(document.getElementById('chartNatureza').getContext('2d'), pieChartConfig);
const chartFormato = new Chart(document.getElementById('chartFormato').getContext('2d'), pieChartConfig);

// Carregar os dados do JSON
const dataUrl = './tabela_area.json';
let jsonData = [];
let filteredData = [];

async function loadData() {
    try {
        const response = await fetch(dataUrl);
        jsonData = await response.json();
        filteredData = [...jsonData];
        initializeDashboard();
        populateFilters();
    } catch (error) {
        console.error('Erro ao carregar os dados do JSON:', error);
    }
}

function processData(key, limit = null) {
    const dataMap = {};
    filteredData.forEach(item => {
        const value = item[key];
        dataMap[value] = (dataMap[value] || 0) + 1;
    });

    let labels = Object.keys(dataMap);
    let values = Object.values(dataMap);

    if (limit) {
        const sortedData = labels.map((label, index) => ({ label, value: values[index] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, limit);

        labels = sortedData.map(item => item.label);
        values = sortedData.map(item => item.value);
    }

    return { labels, values };
}

function updateChart(chart, labels, values) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

function initializeDashboard() {
    const areaData = processData('ÁREA');
    const subAreaData = processData('SUBÁREA');
    const naturezaData = processData('NATUREZA DA PRESTAÇÃO DE SERVIÇO');
    const formatoData = processData('FORMA DA PRESTAÇÃO DO SERVIÇO');
    const portfolioData = processData('NOME DO PORTFOLIO');
    const objetoData = processData('OBJETO DE CONTRATAÇÃO', 10);

    updateChart(chartArea, areaData.labels, areaData.values);
    updateChart(chartSubArea, subAreaData.labels, subAreaData.values);
    updateChart(chartNatureza, naturezaData.labels, naturezaData.values);
    updateChart(chartFormato, formatoData.labels, formatoData.values);
    updateChart(chartPortfolio, portfolioData.labels, portfolioData.values);
    updateChart(chartObjeto, objetoData.labels, objetoData.values);
}

function populateFilters() {
    const filters = {
        area: 'ÁREA',
        subArea: 'SUBÁREA',
        natureza: 'NATUREZA DA PRESTAÇÃO DE SERVIÇO',
        formato: 'FORMA DA PRESTAÇÃO DO SERVIÇO',
        portfolio: 'NOME DO PORTFOLIO',
        objeto: 'OBJETO DE CONTRATAÇÃO'
    };

    Object.entries(filters).forEach(([filterId, key]) => {
        const uniqueValues = [...new Set(jsonData.map(item => item[key]))].sort();
        const select = document.getElementById(`filter${capitalizeFirstLetter(filterId)}`);
        select.innerHTML = `<option value="all">Todos</option>`;
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    });
}

function applyFilters() {
    const areaFilter = document.getElementById('filterArea').value;
    const subAreaFilter = document.getElementById('filterSubArea').value;
    const naturezaFilter = document.getElementById('filterNatureza').value;
    const formatoFilter = document.getElementById('filterFormato').value;
    const portfolioFilter = document.getElementById('filterPortfolio').value;
    const objetoFilter = document.getElementById('filterObjeto').value;

    filteredData = jsonData.filter(item => {
        return (
            (areaFilter === 'all' || item['ÁREA'] === areaFilter) &&
            (subAreaFilter === 'all' || item['SUBÁREA'] === subAreaFilter) &&
            (naturezaFilter === 'all' || item['NATUREZA DA PRESTAÇÃO DE SERVIÇO'] === naturezaFilter) &&
            (formatoFilter === 'all' || item['FORMA DA PRESTAÇÃO DO SERVIÇO'] === formatoFilter) &&
            (portfolioFilter === 'all' || item['NOME DO PORTFOLIO'] === portfolioFilter) &&
            (objetoFilter === 'all' || item['OBJETO DE CONTRATAÇÃO'] === objetoFilter)
        );
    });

    initializeDashboard();
}

document.getElementById('clearFilters').addEventListener('click', () => {
    document.querySelectorAll('.form-select').forEach(select => select.value = 'all');
    filteredData = [...jsonData];
    initializeDashboard();
});

document.querySelectorAll('.form-select').forEach(select => {
    select.addEventListener('change', applyFilters);
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

loadData();
