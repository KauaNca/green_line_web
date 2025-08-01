// Configurações globais
const config = {
  produtosPorPagina: 12,
  fallbackImage:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5lbmh1bWEgSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==",
};

const apiProduto = {
  online: "https://green-line-web.onrender.com",
  index: "http://localhost:3002",
  produto: "http://localhost:3003",
  carrinho: "http://localhost:3006",
  vendas: "http://localhost:3009",
  perfil: "http://localhost:3008",
  login: "http://localhost:3001",
  cadastro_produto: "http://localhost:3005",
  cadastro: "http://localhost:3000",
};

// Classe utilitária para funções auxiliares
class Utils {
  static escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  static gerarEstrelas(nota) {
    if (!nota) return "☆☆☆☆☆";
    const estrelasCheias = Math.round(nota);
    return (
      "★".repeat(estrelasCheias) +
      "☆".repeat(5 - estrelasCheias)
    );
  }

  static mostrarFeedback(mensagem, tipo = "success") {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${tipo} border-0 position-fixed bottom-0 end-0`;
    toast.style.zIndex = 1100;
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${this.escapeHtml(mensagem)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.body.appendChild(toast);
    new bootstrap.Toast(toast).show();
    setTimeout(() => toast.remove(), 5000);
  }

  // Função para formatar preço no padrão brasileiro
  static formatarPrecoBR(valor) {
    // Garantir que o valor seja um número
    const numeroValor = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);
    
    // Verificar se é um número válido
    if (isNaN(numeroValor)) {
      console.warn('Valor inválido para formatação:', valor);
      return 'R$ 0,00';
    }
    
    return numeroValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

// Classe para representar um produto
class Produto {
  constructor(dados) {
    this.id_produto = parseInt(dados.id_produto) || null;
    this.preco = Number(dados.preco) || 0;
    this.preco_promocional = dados.preco_promocional || 0;
    this.promocao = Boolean(dados.promocao);
    this.avaliacao = Number(dados.avaliacao) || 0;
    this.numAvaliacoes = Number(dados.numAvaliacoes) || 0;
    this.estoque = Number(dados.estoque) || 0;
    this.nome = dados.produto || dados.nome || "Produto sem nome";
    this.descricao = dados.descricao || "Sem descrição";
    this.descricao_curta = dados.descricao_curta || this.descricao.substring(0, 100);
    this.categoria = dados.categoria || "Geral";
    this.marca = dados.marca || "Sem marca";
    this.imagem_1 = dados.imagem_1 || config.fallbackImage;
    this.imagem_2 = dados.imagem_2;
    this.imagem_3 = dados.imagem_3;
  }

  get precoFinal() {
    const precoPromocional = Number(this.preco_promocional) || 0;
    // Só usa preço promocional se tiver promoção ativa E preço promocional válido (maior que 0)
    if (this.promocao && precoPromocional > 0) {
      return precoPromocional;
    }
    return Number(this.preco) || 0;
  }

  get temEstoque() {
    const estoque = Number(this.estoque);
    return !isNaN(estoque) && estoque > 0;
  }

  get precoFormatado() {
    const preco = Number(this.preco) || 0;
    const precoPromocional = Number(this.preco_promocional) || 0;

    // Só mostra como promoção se tiver promoção ativa E preço promocional válido (maior que 0)
    if (this.promocao && precoPromocional > 0) {
      // Produto em promoção: preço original riscado em cinza escuro, preço promocional em verde
      return `<span style="text-decoration: line-through; font-size: 0.9rem; color: #555;">${Utils.formatarPrecoBR(preco)}</span>
              <span class="fs-5 ms-2" style="color: #28a745; font-weight: bold;">${Utils.formatarPrecoBR(precoPromocional)}</span>`;
    }
    // Caso contrário, mostra apenas o preço normal em cinza escuro
    return `<span class="fs-5" style="color: #333;">${Utils.formatarPrecoBR(preco)}</span>`;
  }

  criarCard() {
    console.log('[CARD]', this.nome, '| Avaliação:', this.avaliacao, '| Avaliações:', this.numAvaliacoes);
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    card.innerHTML = `
      <div class="card h-100 cursor point" tabindex="0" aria-label="${Utils.escapeHtml(this.nome)}, R$ ${this.precoFinal.toFixed(2)}, ${this.categoria}">
        <img src="${this.imagem_1}" 
             class="card-img-top" 
             alt="${Utils.escapeHtml(this.nome)}"
             loading="lazy"
             style="height: 200px; object-fit: contain;"
             onerror="this.src='${config.fallbackImage}'">
        <div class="card-body">
          <h6 class="card-title">${Utils.escapeHtml(this.nome)}</h6>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-warning">${Utils.gerarEstrelas(this.avaliacao)}</span>
            <small class="text-muted">${this.numAvaliacoes} av.</small>
          </div>
          <p class="card-text text-muted small">${Utils.escapeHtml(this.descricao_curta.substring(0, 60))}${this.descricao_curta.length > 60 ? "..." : ""}</p>
          <p class="fw-bold mb-0">
            ${this.precoFormatado}
          </p>
          ${!this.temEstoque ? '<span class="badge bg-secondary mt-2">Fora de estoque</span>' : ""}
          <p class="">
            ${this.categoria ? `<span class="badge bg-success mt-2">${this.categoria}</span>` : ""}
          </p>
        </div>
      </div>
    `;
    // Adiciona o evento de clique para redirecionar para a página de detalhes
    card.querySelector('.card').addEventListener('click', () => {
      // Salva um objeto plano com todos os campos esperados pelo detalhe
      const produtoDetalhe = {
        id_produto: this.id_produto,
        produto: this.nome,
        nome: this.nome,
        imagem_1: this.imagem_1,
        imagem_2: this.imagem_2,
        imagem_3: this.imagem_3,
        preco: this.preco,
        preco_promocional: this.preco_promocional,
        promocao: this.promocao,
        avaliacao: this.avaliacao,
        numAvaliacoes: this.numAvaliacoes,
        estoque: this.estoque,
        descricao: this.descricao,
        descricao_curta: this.descricao_curta,
        categoria: this.categoria,
        marca: this.marca
      };
      sessionStorage.setItem('produtoSelecionado', JSON.stringify(produtoDetalhe));
      window.location.href = `produto.html?id=${this.id_produto}`;
    });
    return card;
  }
}

// Classe para gerenciar filtros
class Filtros {
  constructor() {
    this.textoBusca = "";
    this.emEstoque = false;
    this.foraEstoque = false;
    this.categorias = [];
  }

  aplicar(produtos) {
    return produtos.filter((produto) => {
      // Filtro por texto
      if (this.textoBusca && !produto.nome.toLowerCase().includes(this.textoBusca.toLowerCase())) {
        return false;
      }

      // Filtro por estoque
      if (this.emEstoque && !produto.temEstoque) return false;
      if (this.foraEstoque && produto.temEstoque) return false;

      // Filtro por categoria
      if (this.categorias.length > 0) {
        const categoriaProduto = produto.categoria.toLowerCase();
        const encontrou = this.categorias.some((cat) =>
          categoriaProduto.includes(cat.toLowerCase())
        );
        if (!encontrou) return false;
      }

      return true;
    });
  }

  resetar() {
    this.textoBusca = "";
    this.emEstoque = false;
    this.foraEstoque = false;
    this.categorias = [];
  }
}

// Classe para gerenciar paginação
class Paginacao {
  constructor(produtosPorPagina) {
    this.produtosPorPagina = produtosPorPagina;
    this.paginaAtual = 1;
    this.elemento = document.querySelector(".pagination");
  }

  calcularPaginas(totalProdutos) {
    return Math.ceil(totalProdutos / this.produtosPorPagina);
  }

  obterProdutosDaPagina(produtos) {
    const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
    const fim = inicio + this.produtosPorPagina;
    return produtos.slice(inicio, fim);
  }

  criarPaginacao(totalProdutos, callback) {
    this.elemento.innerHTML = "";
    const totalPaginas = this.calcularPaginas(totalProdutos);

    for (let i = 1; i <= totalPaginas; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === this.paginaAtual ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        this.paginaAtual = i;
        callback();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      this.elemento.appendChild(li);
    }
  }

  resetar() {
    this.paginaAtual = 1;
  }
}

// Classe principal da aplicação
class ProdutosApp {
  constructor() {
    this.produtos = [];
    this.filtros = new Filtros();
    this.paginacao = new Paginacao(config.produtosPorPagina);
    this.id_pessoa = null;
    this.carregando = false;

    this.elementos = {
      produtosContainer: document.getElementById("container-produtos"),
      filtrosAplicados: document.querySelector(".filter-applied"),
      inputBusca: document.getElementById("inputBusca"),
      statusEstoque: document.getElementById("status-estoque"),
      statusForaEstoque: document.getElementById("status-fora-estoque"),
      categoriaCheckboxes: document.querySelectorAll('input[id^="cat-"]'),
    };

    this.configurarEventos();
  }

  async inicializar() {
    try {
      this.carregando = true;
      const storedId = sessionStorage.getItem("id_pessoa");
      if (storedId) {
        this.id_pessoa = parseInt(storedId);
        console.log("id_pessoa carregado do localStorage:", this.id_pessoa);
      }
      await this.carregarProdutos();
      console.log("Estado após inicialização:", this);
    } catch (erro) {
      console.error("Erro na inicialização:", erro);
      Utils.mostrarFeedback("Opa, algo deu errado! Tente recarregar.", "danger");
    } finally {
      this.carregando = false;
    }
  }

  async carregarProdutos() {
    try {
      this.mostrarLoader();
      const response = await fetch(`${apiProduto.online}/produto`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Produtos recebidos:", data);

      if (Array.isArray(data)) {
        this.produtos = data.map(dados => new Produto(dados));
        this.aplicarFiltros();
      } else {
        throw new Error("Dados inválidos recebidos da API");
      }
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
      this.mostrarErroCarregamento();
    }
  }

  mostrarLoader() {
    this.elementos.produtosContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2">Carregando produtos...</p>
      </div>
    `;
  }

  mostrarErroCarregamento() {
    this.elementos.produtosContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-emoji-frown fs-1 text-danger"></i>
        <p class="text-muted mt-2">Erro ao carregar produtos</p>
        <button class="btn btn-sm btn-outline-primary" onclick="app.carregarProdutos()">
          <i class="bi bi-arrow-repeat"></i> Tentar novamente
        </button>
      </div>
    `;
  }

  aplicarFiltros() {
    const produtosFiltrados = this.filtros.aplicar(this.produtos);
    this.renderizarProdutos(produtosFiltrados);
    this.atualizarFiltrosAplicados();
  }

  renderizarProdutos(produtosFiltrados) {
    this.elementos.produtosContainer.innerHTML = "";

    if (!produtosFiltrados.length) {
      this.elementos.produtosContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search fs-1 text-muted"></i>
          <p class="text-muted mt-2">Nenhum produto encontrado com esses filtros</p>
          <button class="btn btn-sm btn-outline-primary" onclick="app.resetarFiltros()">
            Limpar filtros
          </button>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    const produtosDaPagina = this.paginacao.obterProdutosDaPagina(produtosFiltrados);

    produtosDaPagina.forEach((produto) => {
      const card = produto.criarCard();
      fragment.appendChild(card);
    });

    this.elementos.produtosContainer.appendChild(fragment);
    this.paginacao.criarPaginacao(produtosFiltrados.length, () => this.aplicarFiltros());
  }

  atualizarFiltrosAplicados() {
    this.elementos.filtrosAplicados.innerHTML = "";

    if (this.filtros.textoBusca) {
      this.elementos.filtrosAplicados.appendChild(this.criarTagFiltro(
        `Busca: ${Utils.escapeHtml(this.filtros.textoBusca)}`,
        () => {
          this.elementos.inputBusca.value = "";
          this.atualizarFiltros();
        }
      ));
    }

    if (this.filtros.emEstoque) {
      this.elementos.filtrosAplicados.appendChild(this.criarTagFiltro(
        "Em estoque",
        () => {
          this.elementos.statusEstoque.checked = false;
          this.atualizarFiltros();
        }
      ));
    }

    if (this.filtros.foraEstoque) {
      this.elementos.filtrosAplicados.appendChild(this.criarTagFiltro(
        "Fora de estoque",
        () => {
          this.elementos.statusForaEstoque.checked = false;
          this.atualizarFiltros();
        }
      ));
    }

    this.filtros.categorias.forEach((categoria) => {
      const checkbox = document.getElementById(`cat-${categoria}`);
      if (checkbox) {
        this.elementos.filtrosAplicados.appendChild(this.criarTagFiltro(
          Utils.escapeHtml(checkbox.parentElement.textContent.trim()),
          () => {
            checkbox.checked = false;
            this.atualizarFiltros();
          }
        ));
      }
    });

    if (!this.elementos.filtrosAplicados.children.length) {
      this.elementos.filtrosAplicados.innerHTML = `
        <span class="filter-tag">
          Todos
          <button type="button" aria-label="Nenhum filtro ativo">
            <i class="fas fa-times" style="font-size: 0.75rem;"></i>
          </button>
        </span>
      `;
    }
  }

  criarTagFiltro(texto, onClick) {
    const tag = document.createElement("span");
    tag.className = "filter-tag";
    tag.innerHTML = `
      ${texto}
      <button type="button" aria-label="Remover filtro">
        <i class="fas fa-times" style="font-size: 0.75rem;"></i>
      </button>
    `;
    tag.querySelector("button").addEventListener("click", onClick);
    return tag;
  }

  atualizarFiltros() {
    this.paginacao.resetar();
    this.filtros.textoBusca = this.elementos.inputBusca.value.trim();
    this.filtros.emEstoque = this.elementos.statusEstoque.checked;
    this.filtros.foraEstoque = this.elementos.statusForaEstoque.checked;
    this.filtros.categorias = Array.from(this.elementos.categoriaCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.id.replace("cat-", ""));

    this.aplicarFiltros();
  }

  resetarFiltros() {
    this.paginacao.resetar();
    this.elementos.inputBusca.value = "";
    this.elementos.statusEstoque.checked = false;
    this.elementos.statusForaEstoque.checked = false;
    this.elementos.categoriaCheckboxes.forEach((cb) => (cb.checked = false));
    this.atualizarFiltros();
  }

  configurarEventos() {
    // Eventos de filtro
    this.elementos.inputBusca.addEventListener("input", () => {
      this.filtros.textoBusca = this.elementos.inputBusca.value.trim();
      this.aplicarFiltros();
    });

    this.elementos.statusEstoque.addEventListener("change", () => {
      this.filtros.emEstoque = this.elementos.statusEstoque.checked;
      this.aplicarFiltros();
    });

    this.elementos.statusForaEstoque.addEventListener("change", () => {
      this.filtros.foraEstoque = this.elementos.statusForaEstoque.checked;
      this.aplicarFiltros();
    });

    this.elementos.categoriaCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.atualizarFiltros();
      });
      // Acessibilidade: selecionar com Enter
      checkbox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    // Eventos de compra/carrinho
    document.getElementById("btnComprarAgora").addEventListener("click", () => {
      this.processarCompra();
    });

    document.getElementById("btnAddCarrinho").addEventListener("click", () => {
      this.adicionarAoCarrinho();
    });

    // Definir this.modal ao abrir o modal do produto
    const modal = document.getElementById('produtoModal');
    if (modal) {
      modal.addEventListener('show.bs.modal', () => {
        const produtoSelecionado = sessionStorage.getItem('produtoSelecionado');
        if (produtoSelecionado) {
          this.modal = JSON.parse(produtoSelecionado);
        } else {
          this.modal = null;
        }
      });
    }
  }

  processarCompra() {
    if (!this.id_pessoa) {
      Utils.mostrarFeedback("Por favor, faça login ou cadastro para prosseguir", "danger");
      return;
    }

    // Verifica se o produto está em estoque
    if (this.modal && this.modal.estoque <= 0) {
      Utils.mostrarFeedback("Produto fora de estoque! Não é possível comprar.", "danger");
      return;
    }

    const qtdInput = document.getElementById("quantidadeModal");
    const qtd = parseInt(qtdInput.value, 10);

    if (isNaN(qtd) || qtd <= 0 || qtd > 100) {
      Utils.mostrarFeedback("Quantidade inválida! Por favor, insira um valor entre 1 e 100.", "danger");
      return;
    }

    const nome_produto = document.getElementById("produtoModalLabel").textContent.trim();
    const preco_final = this.obterPrecoFinal();

    if (preco_final === null || preco_final <= 0) {
      Utils.mostrarFeedback("Preço do produto inválido.", "danger");
      return;
    }

    const subtotal = Math.round(preco_final * qtd * 100) / 100;
    const dadosCompra = {
      nome_produto,
      preco_final,
      quantidade: qtd,
      subtotal,
      id_pessoa: this.id_pessoa,
      data: new Date().toISOString(),
      imagem_principal: this.modal.imagem_principal,
      imagem_1: this.modal.imagem_1,
      imagem: this.modal.imagem
    };

    console.log("Dados da compra:", dadosCompra);
    sessionStorage.setItem("dadosCompra", JSON.stringify(dadosCompra));
    window.location.href = "vendas.html";
  }

  obterPrecoFinal() {
    const originalPriceEl = document.querySelector("#produtoModalPreco .original-price");
    const discountPriceEl = document.querySelector("#produtoModalPreco .discount-price");

    if (!originalPriceEl) return null;

    function extrairPreco(elemento) {
      if (!elemento) return null;
      const precoTexto = elemento.textContent.trim();
      const precoNumerico = parseFloat(precoTexto.replace(/[^\d,]/g, "").replace(",", "."));
      return isNaN(precoNumerico) ? null : precoNumerico;
    }

    const isPromocao = window.getComputedStyle(originalPriceEl).textDecoration.includes("line-through");

    if (isPromocao && discountPriceEl) {
      return extrairPreco(discountPriceEl);
    } else {
      return extrairPreco(originalPriceEl);
    }
  }

  async adicionarAoCarrinho() {
    if (!this.id_pessoa) {
      Utils.mostrarFeedback("Por favor, faça login ou cadastro para prosseguir", "danger");
      return;
    }

    // Verifica se o produto está em estoque
    if (this.modal && this.modal.estoque <= 0) {
      Utils.mostrarFeedback("Produto fora de estoque! Não é possível adicionar ao carrinho.", "danger");
      return;
    }

    const quantidade = parseInt(document.getElementById("quantidadeModal").value, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      Utils.mostrarFeedback("Quantidade inválida!", "danger");
      return;
    }

    try {
      const requisicao = await fetch(`${apiProduto.online}/carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pessoa: this.id_pessoa,
          id_produto: this.modal.id_produto,
          quantidade,
        }),
      });

      const resposta = await requisicao.json();

      if (resposta.codigo === 1 || resposta.mensagem === "ITEM_DUPLICADO") {
        Utils.mostrarFeedback("⚠️ Este item já está no seu carrinho", "warning");
      } else if (resposta.sucesso) {
        let badge = document.getElementById("badge-carrinho");
        badge.textContent = parseInt(badge.textContent || "0") + 1;
        Utils.mostrarFeedback("✅ Item adicionado ao carrinho com sucesso!", "success");
      } else {
        Utils.mostrarFeedback("❌ Falha ao adicionar item ao carrinho", "danger");
      }
    } catch (erro) {
      console.error("Erro ao adicionar ao carrinho:", erro);
      Utils.mostrarFeedback("❌ Ocorreu um erro ao adicionar o item ao carrinho", "danger");
    }
  }
}

// Instância global da aplicação
let app;

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  app = new ProdutosApp();
  app.inicializar();
});
