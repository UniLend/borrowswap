import { ConnectButton } from "@rainbow-me/rainbowkit";
// import "@ant-design/react-native/dist/antd.css";
import "./App.scss";
import Card from "./components/Card";
import Navbar from "./components/Navbar";
import SwapCard from "./components/SwapCard";

function App() {
  document.body.className = `body dark`;
  return (
    <div>
      <Navbar />
      {/* <Card /> */}
      <SwapCard />
    </div>
  );
}

export default App;
