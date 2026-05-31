document.getElementById("resultado").readOnly = true;

/* ======== VALIDAÇÃO DE CAMPOS POSITIVOS ======== */
function validarPositivo(id) {
    const campo = document.getElementById(id);
    campo.addEventListener("input", function () {
        let v = this.value;

        v = v.replace(",", ".");
        v = v.replace(/[^0-9.]/g, "");

        const parts = v.split(".");
        if (parts.length > 2) {
            v = parts[0] + "." + parts.slice(1).join("");
        }

        if (v.startsWith("-")) {
            v = v.substring(1);
        }

        this.value = v;
    });
}

validarPositivo("Pitch");
validarPositivo("Hole");
validarPositivo("Diameter");
validarPositivo("RadInc");

/* ======== CAMPOS QUE ACEITAM POSITIVO E NEGATIVO ======== */
function configurarCoordenadas(id) {
    const campo = document.getElementById(id);

    campo.addEventListener("input", function () {
        let v = this.value;

        v = v.replace(",", ".");
        v = v.replace(/[^0-9.\-]/g, "");

        if (v.indexOf("-") > 0) {
            v = "-" + v.replace(/-/g, "");
        }

        const partes = v.split(".");
        if (partes.length > 2) {
            v = partes[0] + "." + partes.slice(1).join("");
        }

        this.value = v;
    });
}

configurarCoordenadas("ZInitial");
configurarCoordenadas("ZFinish");
configurarCoordenadas("CenterX");
configurarCoordenadas("CenterY");

/* ======== GERAR PROGRAMA ======== */
document.getElementById("formCNC").addEventListener("submit", function(e) {
    e.preventDefault();

    /* ======== CONVERTER ======== */
    const ToolNum   = parseFloat(document.getElementById("ToolNum").value);
    const Workoffset= document.getElementById("Workoffset").value;
    const FeedRate  = parseFloat(document.getElementById("FeedRate").value);
    const Speed     = parseFloat(document.getElementById("Speed").value);
    const Pitch     = parseFloat(document.getElementById("Pitch").value);
    const Hole      = parseFloat(document.getElementById("Hole").value);
    const Diameter  = parseFloat(document.getElementById("Diameter").value);
    const RadInc    = parseFloat(document.getElementById("RadInc").value);
    const ZInitial  = parseFloat(document.getElementById("ZInitial").value);
    const ZFinish   = parseFloat(document.getElementById("ZFinish").value);
    const CenterX   = parseFloat(document.getElementById("CenterX").value);
    const CenterY   = parseFloat(document.getElementById("CenterY").value);
    const sentido   = document.getElementById("Sentido").value;

    /* ======== CÁLCULOS ======== */
    const repeatCountDiameter = Math.floor((Diameter - Hole) / RadInc);
    const repeatCountPitch = Math.ceil((ZInitial - ZFinish) / Pitch);
    const NewZinitial = ZFinish + (repeatCountPitch * Pitch);
    let Compensacao , Interpolacao;
        if (sentido === "ESQUERDA") {
            Compensacao = "G41";
            Interpolacao = "G3";
        } else if (sentido === "DIREITA") {
            Compensacao = "G42";
            Interpolacao = "G2";
        }

    /* ======== PROGRAMA CNC ======== */
    const programa = `%
O0001 (ROSCA ${sentido} INTERNA INTERPOLADA)
(G-CODE NC FRESAMENTO)
(GERADO POR EA CNC SOLUTIONS)
(USO DA COMPENSAÇÃO OBRIGATORIA)
(DATA: ${new Date().toLocaleDateString()})
(HORA: ${new Date().toLocaleTimeString()})

T${ToolNum} (FRESA PARA ROSCA)
M6
G${Workoffset} G90 G94 G40
S${Speed} M3

G0 X${CenterX} Y${CenterY}
G43 G0 Z100 H${ToolNum}
( ROSCA ${sentido} INTERNA - DIAMETRO: ${Diameter} - PASSO: ${Pitch} )
G0 Z${(ZInitial + 5).toFixed(3)} M8
G1 Z${ZInitial.toFixed(3)} F${FeedRate}
#1=${(Hole/2).toFixed(3)}+${RadInc}
WHILE[#1 LT ${(Diameter/2).toFixed(3)}] DO1
G91
${Compensacao} G1 X#1 Z${(NewZinitial-ZInitial).toFixed(3)} D${ToolNum}
#2=0
WHILE[#2 LT ${repeatCountPitch}] DO2
${Interpolacao} I-#1 Z-${Pitch.toFixed(3)} F${FeedRate}
#2=#2+1
END2
G90 
G40 G1 X${CenterX} Y${CenterY}
G0 Z${(ZInitial).toFixed(3)}
#1=#1+${RadInc.toFixed(3)}
END1

G91
${Compensacao} G1 X${(Diameter / 2).toFixed(3)} Z${(NewZinitial-ZInitial).toFixed(3)} D${ToolNum}
#2=0
WHILE[#2 LT ${repeatCountPitch}] DO3
${Interpolacao} I-${(Diameter / 2).toFixed(3)} Z-${Pitch.toFixed(3)} F${FeedRate}
#2=#2+1
END3
G90 
G40 G1 X${CenterX} Y${CenterY}
G0 Z${(ZInitial).toFixed(3)}
#1=#1+${RadInc.toFixed(3)}

G0 G40 G90 Z100 M9
M30
%`;

    document.getElementById("resultado").value = programa.trim();
});

/* ======== DOWNLOAD ======== */
document.getElementById("downloadBtn").addEventListener("click", function() {
    const texto = document.getElementById("resultado").value;
    if (!texto.trim()) {
        alert("O programa CNC está vazio. Gere o código antes de baixar.");
        return;
    }

    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");

    link.download = "O0001.nc";
    link.href = window.URL.createObjectURL(blob);
    link.click();
});
