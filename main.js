const board1Html = $("#board1");
const board2Html = $("#board2");
let orientacion = 0;
let turn = "player";
let mode = "edit";
let shipSize = 2;
const images = [
    ["url('./src/PatrolBoat.png')", "url('./src/PatrolBoat1.png')"],
    ["url('./src/Cruiser.png')", "url('./src/Cruiser1.png')"],
    ["url('./src/BattleShip.png')", "url('./src/BattleShip1.png')"],
    ["url('./src/AircraftCarrier.png')", "url('./src/AircraftCarrier1.png')"]
];
let boardSize = 10;
let cellsMarked = 0;
let playerShips = 0;
let cpuShips = 0;

createBoards();

$('#orientation').click(function () {
    orientacion = orientacion === 0 ? 1 : 0;
    $(this).text(orientacion === 0 ? "Horizontal" : "Vertical");
});

$('#play').click(function () {
    if (!playerShips || !cpuShips) {
        alert("Debe haber barcos en ambos tableros");
        return;
    }

    mode = "play";
    $(".p1").css("background-image", "none");
    $("#orientation").hide();
    $(this).attr("disabled", "true");
    $(`#restart`).removeAttr("disabled");
});

$(".form-check-input").change(function() {
    shipSize = parseInt($(this).val());
});

$(".form-control").change(function() {
    boardSize = $(this).val();
    createBoards();
});

function pickCell() {
    turn = "player";
    let flag = false;
    if (cellsMarked >= Math.pow(boardSize, 2)) {
        return;
    }

    while (!flag) {
        let row = Math.round(Math.random() * (boardSize - 1));
        let col = Math.round(Math.random() * (boardSize - 1)) + 1;
        const letter = String.fromCharCode(row + 65);
        const cell = $(`#P2-${letter}${col}`);
        flag = true;
        if (cell.attr("class").includes("crash")) {
            flag = false;
            continue;
        }

        if (cell.attr("class").includes("ship")) {
            cell.css("background-image", "url('./src/explosion.png')");
            cell.css("background-position", `0 0`);
            playerShips--;
            if (playerShips <= 0) {
                setTimeout(() => {
                    alert("Perdiste");
                    let playAgain = confirm("¿Jugar de nuevo?");
                    if (playAgain) {
                        restart();
                    } else {
                        window.location.href = "./index.html";
                    }
                }, 250);
            }
        } else {
            cell.css("background-image", "url('./src/tacha.png')");
        }
        cell.addClass("crash");
    }

    cellsMarked++;
}

function putShip(row, col, player) {
    if ((col > boardSize - shipSize && orientacion === 0) || (row > boardSize - shipSize && orientacion === 1)) {
        alert("No");
    } else {
        let placed = true;

        for (let k = 0; k < shipSize; k++) {
            const cell = orientacion === 0 ?
                $(`#${player}-${String.fromCharCode(row + 65)}${col + k + 1}`) :
                $(`#${player}-${String.fromCharCode(row + k + 65)}${col + 1}`);
            if (cell.attr("class").includes("ship")) {
                placed = false;
                break;
            }
        }

        if (placed) {
            for (let k = 0; k < shipSize; k++) {
                const cell = orientacion === 0 ?
                    $(`#${player}-${String.fromCharCode(row + 65)}${col + k + 1}`) :
                    $(`#${player}-${String.fromCharCode(row + k + 65)}${col + 1}`);
                cell.addClass("ship");
                if (shipSize === 2) {
                    cell.css("background-image", images[0][orientacion]);
                } else if (shipSize === 3) {
                    console.log(3);
                    cell.css("background-image", images[1][orientacion]);
                } else if (shipSize === 4) {
                    cell.css("background-image", images[2][orientacion]);
                } else if (shipSize === 5) {
                    cell.css("background-image", images[3][orientacion]);
                }
                const percentage = 100 / (shipSize - 1);
                cell.css("background-position", orientacion === 0 ? `${percentage * k}% 0` : `0 ${percentage * k}%`);
            }

            if (player === "P1")
                cpuShips += shipSize;
            else
                playerShips += shipSize;
        } else {
            alert("No");
        }
    }
}

function createBoards() {
    board1Html.empty();
    board2Html.empty();

    for (let i = 0; i < boardSize; i++) {
        const letter = String.fromCharCode(i + 65);
        const rowHtml = $(`<div class='row'><span class="col">${letter}</span></div>`);
        for (let j = 0; j < boardSize; j++) {
            const btn = $("<div class='cell col'>");
            rowHtml.append(btn);
            btn.attr("id", `P1-${letter}${j + 1}`)
            btn.addClass("p1");
            btn.addClass(`button`);
            btn.click(() => {
                switch (mode) {
                    case "edit":
                        putShip(i, j, "P1");
                        break;
                    case "play":
                        let winner = false;
                        if (turn !== "CPU") {
                            turn = "CPU";

                            if (btn.attr("class").includes("ship")) {
                                btn.css("background-image", "url('./src/explosion.png')");
                                cpuShips--;
                                console.log(cpuShips);
                                if (cpuShips <= 0) {
                                    winner = true;
                                }
                            } else {
                                btn.css("background-image", "url('./src/tacha.png')");
                            }
                            btn.attr("disabled", "true")
                        }
                        if (winner) {
                            setTimeout(() => {
                                alert("Ganaste!");
                                let playAgain = confirm("¿Jugar de nuevo?");
                                if (playAgain) {
                                    restart();
                                } else {
                                    window.location.href = "./index.html";
                                }
                            }, 250);
                        } else {
                            setTimeout(pickCell, 250);
                        }
                }
            });
        }
        board1Html.append(rowHtml);
    }

    for (let i = 0; i < boardSize; i++) {
        const letter = String.fromCharCode(i + 65);
        const rowHtml = $(`<div class='row'><span class="col">${letter}</span></div>`);
        for (let j = 0; j < boardSize; j++) {
            const btn = $("<div class='cell col'>");
            rowHtml.append(btn);
            btn.attr("id", `P2-${letter}${j + 1}`)
            btn.addClass("p2");
            btn.addClass(`button`);
            btn.click(() => {
                if (mode === "edit") {
                    putShip(i, j, "P2");
                }
            });
        }
        board2Html.append(rowHtml);
    }
    const rowHtml = $(`<div class='row'></div>`);
    for (let i = 0; i <= boardSize; i++) {
        const span = $("<span class='col'>");
        rowHtml.append(span);
        span.text(i)
    }

    board1Html.append(rowHtml);
    board2Html.append(rowHtml.clone());
}

$('#restart').click(restart);

function restart() {
    mode = "edit";
    $(".cell").css("background-image", "none");
    $("#orientation").show();
    $("#play").removeAttr("disabled");
    $("#restart").attr("disabled", true);
    cellsMarked = 0;
    playerShips = 0;
    cpuShips = 0;
    turn = "player";
    createBoards();
}