// Modal script (adaptado de modalscript.js)
        document.querySelectorAll('a.modal-trigger').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('href').substring(1);
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('ativo');
                }
            });
        });
        document.querySelectorAll('.fechar-modal').forEach(botao => {
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('ativo');
                }
            });
        });
        // Script para abas
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
                window.scrollTo({top: 0, behavior: 'smooth'});
            });
        });


        // Função de filtro para cada aba
        function filterProducts(inputId, gridId) {
            const input = document.getElementById(inputId);
            const grid = document.getElementById(gridId);
            if (!input || !grid) return;
            input.addEventListener('input', function(event) {
                const value = event.target.value.toLowerCase().trim();
                const cards = grid.querySelectorAll('.product-card');
                let hasResults = false;
                cards.forEach(card => {
                    if (card.textContent.toLowerCase().indexOf(value) !== -1) {
                        card.style.display = 'block';
                        hasResults = true;
                    } else {
                        card.style.display = 'none';
                    }
                });
                // Opcional: mostrar mensagem se nenhum resultado
                let noResult = grid.querySelector('.no-result');
                if (!hasResults) {
                    if (!noResult) {
                        // Aqui pode adicionar mensagem de "nenhum resultado" se quiser
                        // Exemplo:
                        // noResult = document.createElement('div');
                        // noResult.className = 'no-result';
                        // noResult.textContent = 'Nenhum resultado encontrado.';
                        // grid.appendChild(noResult);
                    }
                } else {
                    if (noResult) noResult.remove();
                }
            });
        }
        filterProducts('search-docinhos', 'produtos-docinhos');
        filterProducts('search-gelados', 'produtos-gelados');
        filterProducts('search-bolos', 'produtos-bolos');
        filterProducts('search-folhados', 'produtos-folhados');

        // Smooth scroll para links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Menu toggle mobile
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('active');
            });
        }

document.querySelectorAll(".selecionarSabor").forEach(select => {
    select.addEventListener("change", function(e) {
        var selectedFlavor = e.target.value;
        // Pega a seção de imagem associada ao 'select' que disparou o evento
        var tipo = e.target.getAttribute("data-tipo");
        var modalImagem = document.querySelector(`.modalImagem[data-tipo="${tipo}"]`);
        
        // Atualiza a imagem com base no sabor selecionado
        modalImagem.src = `./img/${selectedFlavor}`;
    });
});

const urlParams = new URLSearchParams(window.location.search);
const tabFromURL = urlParams.get("tab");

if (tabFromURL) {
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabFromURL}"]`);
    const targetContent = document.getElementById(tabFromURL);

    if (targetBtn && targetContent) {
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
        targetBtn.classList.add("active");
        targetContent.classList.add("active");
    }
}