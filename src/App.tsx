import {Home} from "./pages/Home.tsx";
import {Route, Routes} from "react-router-dom";
import {Table} from "./pages/Table.tsx";
import {Metrics} from "./pages/Metrics.tsx";
import {Menu} from "./pages/Menu.tsx";
import {Kitchen} from "./pages/Kitchen.tsx";
import {OrderTicket} from "./pages/OrderTicket.tsx";
import {NewProduct} from "./pages/NewProduct.tsx";
import {EditProduct} from "./pages/EditProduct.tsx";
import {OrderForm} from "./pages/OrderForm.tsx";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/table" element={<Table />} />
      <Route path="/order-ticket" element={<OrderTicket />} />
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/edit-product/:id" element={<EditProduct />} />
      <Route path="/metrics" element={<Metrics />} />
      <Route path="/tables/:tableId/order" element={<OrderForm />} />
    </Routes>
  )
}

export default App
