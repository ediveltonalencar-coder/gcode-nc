document.getElementById("Profile").addEventListener("input", function () {
    this.value = this.value.toUpperCase();
});

// Força incremento a ser decimal com ponto e positivo
document.getElementById("ZIncrement").addEventListener("input", function () {
    let v = this.value;

    // Troca vírgula por ponto
    v = v.replace(",", ".");

    // Remove tudo que não for número, ponto ou sinal +
    v = v.replace(/[^0-9.]/g, "");

    // Impede mais de um ponto
    const parts = v.split(".");
    if (parts.length > 2) {
        v = parts[0] + "." + parts.slice(1).join("");
    }

    // Impede valores negativos
    if (v.startsWith("-")) {
        v = v.substring(1);
    }

    this.value = v;
});

function configurarCoordenadas(id) {
    const campo = document.getElementById(id);

    campo.addEventListener("input", function () {
        let v = this.value;

        // Troca vírgula por ponto
        v = v.replace(",", ".");

        // Remove tudo que não for número, ponto ou sinal de negativo
        v = v.replace(/[^0-9.\-]/g, "");

        // Permite apenas UM sinal de negativo e somente no início
        if (v.indexOf("-") > 0) {
            v = "-" + v.replace(/-/g, "");
        }

        // Permite apenas UM ponto decimal
        const partes = v.split(".");
        if (partes.length > 2) {
            v = partes[0] + "." + partes.slice(1).join("");
        }

        this.value = v;
    });
}

// Aplica a função aos campos Z
configurarCoordenadas("ZInitial");
configurarCoordenadas("ZFinish");
configurarCoordenadas("XSafe");
configurarCoordenadas("YSafe");

document.getElementById("formCNC").addEventListener("submit", function(e) {
    e.preventDefault();

    const ToolNum = document.getElementById("ToolNum").value;
    const Workoffset = document.getElementById("Workoffset").value;
    const XSafe = document.getElementById("XSafe").value;
    const YSafe = document.getElementById("YSafe").value;
    const ZInitial = document.getElementById("ZInitial").value;
    const ZFinish = document.getElementById("ZFinish").value;
    const ZIncrement = document.getElementById("ZIncrement").value;
    const FeedRate = document.getElementById("FeedRate").value;

    // Agora sim: pega o valor do campo
    const Profile = document.getElementById("Profile").value.toUpperCase();

    const programa = `%
O0001 (CONTORNO - FRESAMENTO)
(G-CODE NC FRESAMENTO)
(GERADO POR EA CNC SOLUTIONS)
(DATA: ${new Date().toLocaleDateString()})
(HORA: ${new Date().toLocaleTimeString()})

T${ToolNum} (FRESA DE CONTORNO)
M6
G${Workoffset} G90 G94 G40

G0 X${XSafe} Y${YSafe}
G43 G0 Z100 H${ToolNum} D${ToolNum}

#1=Z${ZInitial}
G0 Z[#1+5]

N1000 G1 Z#1 F${FeedRate}
(INICIO DO PERFIL)
${Profile}
(FIM DO PERFIL)
G40 G0 X${XSafe} Y${YSafe}
#1=#1-${ZIncrement}
IF[#1 GT ${ZFinish}] GOTO1000

G1 Z${ZFinish}
${Profile}
G40 G0 X${XSafe} Y${YSafe}

G0 Z100

M30
%
`;

    document.getElementById("resultado").value = programa;
});

// Download
document.getElementById("downloadBtn").addEventListener("click", function() {
    const texto = document.getElementById("resultado").value;
    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");

    link.download = "O0001.NCF";
    link.href = window.URL.createObjectURL(blob);
    link.click();
});
