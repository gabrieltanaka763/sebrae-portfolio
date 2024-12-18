(function redirectIfNotLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redireciona para a página de login
        window.location.href = '../index.html';
    }
})();

const fixedColors = [
    '#4e73df', // Azul
    '#1cc88a', // Verde
    '#36b9cc', // Azul Claro
    '#f6c23e', // Amarelo
    '#e74a3b', // Vermelho
    '#858796', // Cinza
    '#5a5c69', // Cinza Escuro
    '#ff9f40', // Laranja
    '#71c9ce', // Verde Água
    '#a29bfe'  // Roxo Claro
];


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
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'], // Cores fixas
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Mantém as dimensões no CSS
        plugins: {
            legend: {
                display: true,
                position: 'top', // Alinha a legenda ao topo
            },
            tooltip: { enabled: true }
        },
        // Remove eixos e gridlines, específicos para gráficos de pizza
        scales: {
            x: { display: false },
            y: { display: false }
        }
    }
};
// Aplica o estado salvo ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    const areaChartCanvas = document.getElementById("chart-area").getContext("2d");
    const subareaChartCanvas = document.getElementById("chart-subarea").getContext("2d");
    const portfolioChartCanvas = document.getElementById("chart-portfolio").getContext("2d");
    const objetoChartCanvas = document.getElementById("chart-contratacao").getContext("2d");
    const areaFilter = document.getElementById("area-filter");
    const subareaFilter = document.getElementById("subarea-filter");
    const naturezaFilter = document.getElementById("natureza-filter");
    const formatoFilter = document.getElementById("formato-filter");
    const clearAllFiltersButton = document.getElementById("clear-all-filters");


    let rawData = [];
    let filteredData = [];
    let charts = {};

        
    fetch("../../files/Energia_Renovaveis.json")
        .then(response => response.json())
        .then(data => {
            rawData = data;
            filteredData = data;

            populateFilters(data);
            updateCharts(data);
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));

    function populateFilters(data) {
        populateSelect(areaFilter, "Modalidade", data, "Todas");
        populateSelect(subareaFilter, "Instrumento", data, "Todas");
        populateSelect(naturezaFilter, "Temas", data, "Todas");
        populateSelect(formatoFilter, "Subtemas", data, "Todos");
    }

    function populateSelect(selectElement, key, data, placeholder) {
        const selectedValue = selectElement.value || "";
        const items = [...new Set(data.map(item => item[key]))].sort();
        clearSelect(selectElement, placeholder);

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            if (item === selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });

        if (!selectedValue) {
            selectElement.value = "";
        }
    }

    function clearSelect(selectElement, placeholder) {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    }

    
    function filterData() {
        const selectedArea = areaFilter.value;
        const selectedSubarea = subareaFilter.value;
        const selectedNatureza = naturezaFilter.value;
        const selectedFormato = formatoFilter.value;

        filteredData = rawData.filter(item => {
            const matchesArea = !selectedArea || item['Modalidade'] === selectedArea;
            const matchesSubarea = !selectedSubarea || item['Instrumento'] === selectedSubarea;
            const matchesNatureza = !selectedNatureza || item['Temas'] === selectedNatureza;
            const matchesFormato = !selectedFormato || item['Subtemas'] === selectedFormato;

            return matchesArea && matchesSubarea && matchesNatureza && matchesFormato;
        });

        updateDependentFilters();
        updateCharts(filteredData);
    }

    function updateDependentFilters() {
        populateSelect(areaFilter, "Modalidade", filteredData, "Todas");
        populateSelect(subareaFilter, "Instrumento", filteredData, "Todas");
        populateSelect(naturezaFilter, "Temas", filteredData, "Todas");
        populateSelect(formatoFilter, "Subtemas", filteredData, "Todos");
    }

    function updateCharts(data) {
        updateChart("areaChart", areaChartCanvas, "bar", countBy(data, "Modalidade"), "Áreas");
        updateChart("subareaChart", subareaChartCanvas, "bar", countBy(data, "Instrumento"), "Subáreas");
        updateChart("portfolioChart", portfolioChartCanvas, "bar", countBy(data, "Temas"), "Portfólios");
        updateChart("objetoChart", objetoChartCanvas, "bar", countBy(data, "Subtemas"), "Objetos de Contratação", 10);
    }

    
    function countBy(data, key) {
        return data.reduce((acc, item) => {
            acc[item[key]] = (acc[item[key]] || 0) + 1;
            return acc;
        }, {});
    }

    function updateChart(chartName, canvas, type, counts, label, limit = null) {
        if (charts[chartName]) {
            charts[chartName].destroy();
        }

        let labels = Object.keys(counts);
        let values = Object.values(counts);

        if (limit && labels.length > limit) {
            const sortedData = labels
                .map((label, index) => ({ label, value: values[index] }))
                .sort((a, b) => b.value - a.value)
                .slice(0, limit);

            labels = sortedData.map(item => item.label);
            values = sortedData.map(item => item.value);
        }

        const config = {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    backgroundColor: fixedColors.slice(0, labels.length),
                }]
            },
            options: type === 'pie' ? pieChartConfig.options : {
                responsive: true,
                plugins: {
                    legend: { display: type === "pie" },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        };

        charts[chartName] = new Chart(canvas, config);
    }

    

    document.querySelectorAll(".clear-filter-btn").forEach(button => {
        button.addEventListener("click", event => {
            const filterId = event.target.dataset.filter;
            const filterElement = document.getElementById(filterId);

            if (filterElement) {
                filterElement.value = "";
                filterData();
            }
        });
    });

    clearAllFiltersButton.addEventListener("click", () => {
        areaFilter.value = "";
        subareaFilter.value = "";
        naturezaFilter.value = "";
        formatoFilter.value = "";

        filteredData = rawData;
        updateDependentFilters();
        updateCharts(filteredData);
    });

    areaFilter.addEventListener("change", filterData);
    subareaFilter.addEventListener("change", filterData);
    naturezaFilter.addEventListener("change", filterData);
    formatoFilter.addEventListener("change", filterData);
});
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const submenu = item.nextElementSibling;
        submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    });
});
