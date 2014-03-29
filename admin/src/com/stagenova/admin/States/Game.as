package com.stagenova.admin.States
{
    import com.stagenova.admin.Main;
    import flash.display.Stage;

    public class Game 
    {
        private var _stage:Stage;
        private var assets:Assets;

        public function Game (main:Main)
        {
            assets = new Assets();
            _stage = main._stage;

            _stage.addChild(assets);
        }
    }
}
