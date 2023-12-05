import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import { JoinForm } from "./components/JoinForm";
import { Lobby } from "./components/Lobby";
import { Game } from "./components/Game";
import Results from "./components/Results";

const AppRoutes = [
  {
    index: true,
    element: <Home/>
  },
  {
    path: '/lobby',
    element: <Lobby/>
  },
];

export default AppRoutes;
