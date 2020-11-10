import Ember from "ember";
import config from "../config/common";
import CetMIABGameBoard from "cet-miab-game-core/components/cet-miab-game-board";
import constants from "cet-miab-game-core/util/constants";

export default CetMIABGameBoard.extend({
    tagName: "",
    cetMiabGameModalService: Ember.inject.service(),
    init() {
        this._super(...arguments);
        this.set("puzzleBoard", Ember.A([]));
        this.set("validPuzzleBoard", this.getValidPuzzleBoard());
        this.set("puzzleBoardRowCount", 8);
        this.set("puzzleBoardColCount", 8);
        this.setGameState(constants.GAMESTATE.STOPPED);
        this.shufflePuzzleBoard();
    },
    getValidPuzzleBoard() {
        return config.validPuzzleMap;
    },
    isPuzzleValid() {
        let isValid = true;
        let row;
        let col;
        let breakLoop = false;
        let puzzleBoard = this.get("puzzleBoard");
        for (row = 0; row < this.get("puzzleBoardRowCount"); row++) {
            for (col = 0; col < this.get("puzzleBoardColCount"); col++) {
                if (puzzleBoard.objectAt(row).get(col + ".url") !== config.validPuzzleMap[row][col].url) {
                    isValid = false;
                    breakLoop = true;
                    break;
                }
            }

            if (breakLoop) {
                break;
            }
        }

        return isValid;
    },
    swapPuzzlePieces() {
        let focusedPuzzlePieces = this.getFocusedPuzzlePieces();
        let puzzlePieceURL1 = focusedPuzzlePieces[0].puzzle.get("url");
        let puzzlePieceURL2 = focusedPuzzlePieces[1].puzzle.get("url");
        let puzzleBoard = this.get("puzzleBoard");
        puzzleBoard.objectAt(focusedPuzzlePieces[0].row).set(focusedPuzzlePieces[0].col + ".url", puzzlePieceURL2);
        puzzleBoard.objectAt(focusedPuzzlePieces[1].row).set(focusedPuzzlePieces[1].col + ".url", puzzlePieceURL1);
        this.addMoves();
    },
    actions: {
        onPuzzlePieceClick(puzzlePiece, row, col) {
            if (this.isPuzzlePieceFocused(row, col) === true) {
                this.clearFocus(row, col);
                return false;
            }

            let focusedPuzzleCount = this.getFocusedPuzzlePiecesCount();
            if (focusedPuzzleCount === 0) {
                this.addFocus(row, col);
            } else {
                this.addFocus(row, col);
                this.swapPuzzlePieces();
                this.clearFocus();

                if (this.isPuzzleValid()) {
                    this.gameWon();
                }
            }
        },
        onGameCtrlBtnClick() {
            if (this.get("gameState") === constants.GAMESTATE.STOPPED) {
                this.resetGame();
                this.showInstructions({
                    modalComponent: "cet-miab-picture-puzzle-help-modal",
                    showControls: true,
                    onOkClick: this.startGame.bind(this),
                    okText: "Start"
                });
            } else if (this.get("gameState") === constants.GAMESTATE.STARTED) {
                this.stopGame();
                this.get("cetMiabGameModalService").show({
                    component: "cet-miab-game-win-modal",
                    showControls: true,
                    onOkClick: this.changeGame,
                    okText: "Next Game",
                    hideClose: true
                });
            }   
        },
        timesUpAction() {
            this.stopGame();
        }
    }
});