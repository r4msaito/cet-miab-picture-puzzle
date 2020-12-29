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
        this.set("puzzleBoardRowCount", 6);
        this.set("puzzleBoardColCount", 6);
        this.createPuzzleBoard(config.validPuzzleMap);
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
                this.get("cetMiabGameModalService").show({
                    title: this.get("cetMIABTranslation").t.common.help_modal.title,
                    component: "cet-miab-picture-puzzle-help-modal",
                    showControls: true,
                    onOkClick: function() {
                        this.shufflePuzzleBoard();
                        this.startGame();
                    }.bind(this),
                    okText: this.get("cetMIABTranslation").t.common.controls.start
                });
            } else if (this.get("gameState") === constants.GAMESTATE.STARTED) {
                this.stopGame();

            }
        },
        showInstructionsAction() {
            this.showInstructions({
                component: "cet-miab-picture-puzzle-help-modal",
                title: this.get("cetMIABTranslation").t.common.help_modal.title
            });
        },
        showReferenceImageAction() {
            this.get("cetMiabGameModalService").show({
                title: this.get("cetMIABTranslation").t.common.reference_image,
                component: "cet-miab-picture-puzzle-reference-image-modal",
                showControls: false,
                onOkClick: function() {
                    this.close();
                },
                okText: this.get("cetMIABTranslation").t.common.close
            });
        },
        timesUpAction() {
            this.stopGame();
            this.get("cetMiabGameModalService").show({
                component: "cet-miab-game-timesup-modal",
                showControls: false
            });
        }
    }
});