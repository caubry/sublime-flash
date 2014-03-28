package com.__company_name__.__project_name__.States
{
    import com.__company_name__.__project_name__.Main;
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