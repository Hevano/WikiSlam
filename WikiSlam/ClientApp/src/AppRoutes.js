import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import { JoinForm } from "./components/JoinForm";
import { Lobby } from "./components/Lobby";

const AppRoutes = [
  {
    index: true,
    element: <Home/>
  },
  {
    path: '/join',
    element: <JoinForm/>
  },
  {
    path: '/lobby',
    element: <Lobby/>
  },
  {
    path: '/counter',
    element: <Counter />
  },
  {
    path: '/fetch-data',
    element: <FetchData />
  }
];

export default AppRoutes;
