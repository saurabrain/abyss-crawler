import { Game } from './engine/Game.js';
import { MenuState } from './states/MenuState.js';

const game = new Game();
game.setState(new MenuState());
