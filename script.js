document.getElementById('contratoSelect').addEventListener('change', function () {
  if (this.value) {
    window.location.href = this.value;
  }
});

document.getElementById("requerentes-form").addEventListener("blur", async function (event) {
  if (event.target.name === "cep") {
    const cep = event.target.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      alert("CEP inválido! Certifique-se de inserir 8 dígitos.");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado!");
        return;
      }

      const fieldset = event.target.closest("fieldset");
      fieldset.querySelector('[name="endereco"]').value = data.logradouro || "Não informado";
      fieldset.querySelector('[name="bairro"]').value = data.bairro || "Não informado";
      fieldset.querySelector('[name="cidade"]').value = data.localidade || "Não informado";
      fieldset.querySelector('[name="estado"]').value = data.uf || "Não informado";
      fieldset.querySelector('[name="complemento"]').value = "";
      fieldset.querySelector('[name="numero"]').value = "";
    } catch (error) {
      console.error("Erro na busca do CEP:", error);
    }
  }
}, true);

const { pdfMake } = window;

document.getElementById("gerar-pdf").addEventListener("click", async () => {
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(`Erro ao carregar a imagem: ${url}`);
    });
  };

  const dataEmissao = new Date().toLocaleDateString();
  const cidadania = document.getElementById('cidadania').value;

  try {
    const bgImage = await loadImageAsBase64("/assets/bg.png");
    const requerentes = document.querySelectorAll(".requerente");

    const content = [
      {
        text: `ACORDO ENTRE AS PARTES PARA COLABORAÇÃO PROFISSIONAL EM ${cidadania.toUpperCase()}`,
        style: "header",
        margin: [0, 20, 0, 10],
      },
      {
        text: "I. DAS PARTES",
        style: "subheader",
        bold: true,
        margin: [0, 10, 0, 10]
      },
      {
        text: "Pelo presente instrumento particular, de um lado:",
        style: "paragraph",
        margin: [0, 10, 0, 10],
      },
    ];

    requerentes.forEach((requerente) => {
      const campos = requerente.querySelectorAll("input, select");
      const dados = Array.from(campos).map((campo) => campo.value);

      const [
        nome,
        rg,
        cpf,
        cep,
        endereco,
        bairro,
        cidade,
        numero,
        complemento,
        estado,
      ] = dados;

      function formatarCPF(cpf) {
        return cpf.replace(/\D/g, "")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{2})$/, "$1-$2");
      };

      const cpfFormatado = formatarCPF(cpf);

      const dadosImigrei = [
        { text: "CONTRATADA: ", bold: true },
        { text: "Imigrei Assessoria de Imigração LTDA, inscrita no CNPJ sob o nº 48.429.887/0001-64, com sede no Brasil, localizada na Lagoa da Conceição, Florianópolis, SC, e filial na Itália, situada em Corso Vittorio Emanuele, nº 75, Soave (VR), CEP 37038, neste ato representada por sua advogada Ana Caroline Azevedo Michelon, brasileira e italiana, solteira, portadora da carteira de identidade nº 45.661.346-8 e inscrita no CPF sob o nº 442.462.388-21, residente e domiciliada na Via Pigna, nº 22, Soave (VR), CEP 37038." },
      ]

      content.push(
        { text: dadosImigrei, style: "paragraph", margin: [0, 10, 0, 10] }
      );

      const textoRequerente = [
        { text: "CONTRATANTE: ", bold: true, styles: "paragraph" },
        { text: `${nome}, portador do RG nº ${rg} e do CPF n. ${cpfFormatado}. Residente e domiciliado em ${endereco}, nº${numero}, ${complemento}, bairro ${bairro}, cidade ${cidade} - ${estado} - CEP: ${cep}.` }
      ];

      content.push({ text: textoRequerente, style: "paragraph", margin: [0, 10, 0, 10] });

    });

    const textosFinais = [
      { titulo: "Objeto do Contrato:", descricao: `\nPrestação de serviços profissionais para o procedimento de reconhecimento de ${cidadania} por atribuição ou aquisição, mediante análise documental, preparação, assessoria e acompanhamento do processo junto às autoridades portuguesas competentes.` },
      { titulo: "Qualificação do Contrato:", descricao: "\nAs partes prestam garantias mútuas de que a relação objeto do presente contrato deve ser entendida para todos os efeitos de natureza autônoma e profissional, não configurando qualquer vínculo empregatício ou relação de subordinação." },
      { titulo: "Análise e Protocolo da Documentação", descricao: `\nA CONTRATADA se compromete a analisar e protocolar a pasta referente ao processo de ${cidadania}. Caso haja alguma inconsistência na documentação apresentada, a pasta será devolvida ao parceiro para que as correções sejam feitas. Após a devida correção, a CONTRATADA retomará o processo de protocolo.` },
      { titulo: "Da Exclusividade", descricao: `\nA CONTRATADA terá exclusividade na condução do processo de reconhecimento de ${cidadania} do CONTRATANTE, não sendo permitida a contratação de terceiros para o mesmo fim sem prévia anuência da CONTRATADA` },
      { titulo: "Honorários e Métodos de Pagamento ", descricao: "\nAs partes concordam que o valor total dos honorários será de 400 euros (quatrocentos euros) para filhos, 500 euros( quinhentos euros) para netos e 400 euros (quatrocentos euros) para residência e matrimônio, além das taxas administrativas e consulares no valor de 175 euros (cento e setenta e cinco euros) para filhos e netos e de 250 euros( duzentos e cinquenta euros) para residência e matrimônio , que deverão ser pagos diretamente pelo CONTRATANTE à CONTRATADA. " },
      { titulo: "Duração", descricao: "\nO presente contrato terá duração de 1 (um) ano a partir da data de assinatura, sendo renovado tacitamente por igual período, salvo manifestação contrária de qualquer das partes, comunicada com 30 (trinta) dias de antecedência." },
      { titulo: "Confidencialidade", descricao: "\nAs partes se comprometem a manter em sigilo todas as informações obtidas em razão deste contrato, não podendo divulgá-las a terceiros sem autorização expressa, exceto quando necessário para o cumprimento das obrigações contratuais." }
    ];

    const clausulas = [
      {
        text: "As partes acordam e estipulam um contrato de colaboração profissional com as seguintes condições:\n\n",
        style: "paragraph",
      },
      {
        ol: textosFinais.map(item => ({
          text: [{ text: item.titulo, bold: true }, " " + item.descricao],
        })),
        style: "list",
      },
    ];

    content.push(...clausulas);

    content.push({ text: "E, por estarem justas e acordadas, as partes assinam o presente contrato em duas vias de igual teor e forma.", style: 'paragraph', margin: [0, 10, 0, 10] });

    content.push(
      { text: `Verona, ${dataEmissao}`, style: "paragraph", margin: [0, 20, 0, 15], bold: true }
    );

    content.push({ text: "________________________________________________________________________________", alignment: "center", margin: [0, 10, 0, 15] });

    content.push(
      { text: "________________________________________", margin: [0, 45, 0, 5] },
      { text: "ANA CAROLINE MICHELON", style: "assinaturaNome", margin: [0, 0, 0, 5] },
      { text: "OA 66334P", style: "assinaturaNome", margin: [0, 0, 0, 5] },
      { text: "416.578 OAB/SP", style: "assinaturaNome", margin: [0, 0, 0, 5] },
    );

    const nome = document.getElementById('nome')?.value || "NOME NÃO INFORMADO";
    const oab = document.getElementById('oab')?.value || "OAB NÃO INFORMADO";

    content.push(
      { text: "________________________________________", margin: [0, 25, 0, 5] },
      { text: nome, style: "assinaturaNome", margin: [0, 0, 0, 5] },
      { text: oab, style: "assinaturaNome", margin: [0, 0, 0, 5] },
    );

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [80, 60, 80, 50],
      content: content,
      styles: {
        header: { bold: true, fontSize: 11 },
        subHeader: { bold: true, fontSize: 11 },
        list: { fontSize: 11, margin: [30, 0, 0, 5] },
        paragraph: { fontSize: 11, alignment: "justify" },
        assinaturaNome: { fontSize: 11, bold: true },
      },
      background: {
        image: bgImage,
        width: 595.28,
        height: 841.89,
      },
    };

    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      link.download = `Contrato Parceria.pdf`;

      link.click();
      URL.revokeObjectURL(link.href);
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Ocorreu um erro ao gerar o PDF.");
  }
});
