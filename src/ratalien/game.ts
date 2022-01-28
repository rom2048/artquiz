import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import { Vector, IVector } from "../common/vector";
import { GameSide } from "./gameSidePanel";
import { BotPlayer } from "./botPlayer";
import { tech } from "./techTree";
import { GamePlayer, IBuildInfo } from "./gamePlayer";
import { consts } from "./globals";
import { GameField } from "./gameField";
import { GameModel } from './gameModel';
import { GameMap } from "./gameMap";
import { IGameOptions } from './IGameOptions';

import { MiniMapGame } from './miniMapGame'
import { ITechBuild } from "./interactives";

const initialBuildingsData = [{
  name: 'barracs',
  x: 0,
  y: 10
},
{
  name: 'buildingCenter',
  x: 5,
  y: 10 
},
{
  name: 'energyPlant',
  x: 10,
  y: 10
},
{
  name: 'carFactory',
  x: 5,
  y: 15
}]

export class Game extends Control {
  player: GamePlayer;
  currentPlayer: number = 0;
  onExit: () => void;
  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>, options: IGameOptions) {
    super(parentNode, 'div', red['global_wrapper']);
    this.node.onmouseleave = (e) => {
      // console.log(e.offsetX, e.offsetY);
      if (e.offsetX > this.node.clientWidth) {
        field.map.currentMove = consts.moves[5]
      }
      if (e.offsetX < 0) {
        field.map.currentMove = consts.moves[3]
      }
      if (e.offsetY > this.node.clientHeight) {
        field.map.currentMove = consts.moves[7]
      }
      if (e.offsetY < 0) {
        field.map.currentMove = consts.moves[1]
      }
    }
    this.node.onmouseenter = () => {
      field.map.currentMove = null;
    }
    this.node.oncontextmenu = e => e.preventDefault();
    /*window.onmousemove = ()=>{
      console.log('mv');
    }*/
    const head = new Control(this.node, 'div', red["global_header"]);
    const main = new Control(this.node, 'div', red["global_main"]);
    //
    const buttonExit = new Control(main.node, 'button', red["exit_button"], 'Exit')
    buttonExit.node.onclick = () => {
      this.onExit();
    }
    //
    //const field = new GameField(main.node, res);
    const gameModel = new GameModel();

    const player = new GamePlayer();
    player.setMoney(options.credits);
    const botPlayer = new BotPlayer(new Vector(20, 20));
    const map = new GameMap(options.map, res);

    //миниатюра карты
    const miniMap = new MiniMapGame(options.map);

    const field = new GameField(main.node, res, [player, botPlayer], map, miniMap);

    //add initial buildings
    
    initialBuildingsData.map(build => {
      const building = tech.builds.find(item => item.name === build.name);
      if(building){
        field.addObject(0, building, build.x, build.y)
      }
    });
    //console.log('builds',player.builds);

    player.onBuild = (build, pos) => {
      field.addObject(0, build, pos.x, pos.y)
    }
    botPlayer.onBuild = (build, pos) => {
      //     let build = botPlayer.getBuild();      
      //botPlayer.builds.push(build);
      //console.log(build.name)
      field.addObject(1, build, pos.x, pos.y);
      //field.addObject(1, tech.builds.find(it=>it.name == 'barracs'), pos.x, pos.y);
    }

    botPlayer.onUnit = () => {
      const availableUnit = botPlayer.getAvailableUnits();
      if (!availableUnit.length) {
        return;
      }
      const unit = availableUnit[Math.floor(Math.random() * availableUnit.length)];
      console.log(unit.name)
      botPlayer.units.push(unit);
      field.addUnit(1, unit.name);
    }

    //botPlayer.

    botPlayer.onAttack = () => {
      //let botUnits = field.units.filter(it=>it.player==1);
      let playerBuilds = field.objects.list.filter(it => it.player == 0);
      //console.log('playerBuilds',playerBuilds.length)
      if (playerBuilds.length == 0) return;
      /*botUnits.forEach(it=>{
        if (it.attackTarget.health<=0){
          it.attackTarget = null;
        }
      })*/
      //if (botUnits.length ==0) return;
      //botUnits[Math.floor(Math.random()* botUnits.length)].attackTarget = playerBuilds[Math.floor(Math.random()* playerBuilds.length)];
    }


    //const side = new GameSide(main.node);
    //player.getAvailableBuilds();



    const side = new GameSide(main.node, player, miniMap);



    side.onBuildSelect = (name, callback) => {
      //field.setMode(1, name.desc[0], callback);
      field.setPlanned(name.desc[0], callback);
    }
    side.onUnitReady = (name: string) => {
      field.addUnit(0, name);
    }
  }
}
