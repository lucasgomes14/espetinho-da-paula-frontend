import {Home} from "./pages/Home.tsx";
import {Route, Routes} from "react-router-dom";
import {Table} from "./pages/Table.tsx";
import {Metrics} from "./pages/Metrics.tsx";
import {Menu} from "./pages/Menu.tsx";
import {Kitchen} from "./pages/Kitchen.tsx";
import {OrderTicket} from "./pages/OrderTicket.tsx";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Table" element={<Table />} />
      <Route path="/OrderTicket" element={<OrderTicket />} />
      <Route path="/Kitchen" element={<Kitchen />} />
      <Route path="/Menu" element={<Menu />} />
      <Route path="/Metrics" element={<Metrics />} />
    </Routes>
  )
}

export default App
