
import { Home } from "./components/Home";
import { Lobby } from "./components/Lobby";

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
