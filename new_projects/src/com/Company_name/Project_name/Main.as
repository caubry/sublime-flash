package com.!company_name!.!project_name!
{
	import com.!company_name!.!project_name!.States.Game;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.Event;

    public class Main extends Sprite
    {
    	private var game:Game;

        public function Main ()
        {
            if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
        }

        private function init(e:Event = null):void
		{
			startGame();
			removeEventListener(Event.ADDED_TO_STAGE, init);
		}

		private function startGame():void
		{
			game = new Game(this);
		}

		public function get _stage():Stage
		{
			return stage;
		}
    }
}