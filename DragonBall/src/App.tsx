import { Route, Switch } from "wouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import UniversePage from "./pages/UniversePage";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Persistent top navbar with radar indicators and route portals */}
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/universe" component={UniversePage} />
          {/* Fallback route back to home */}
          <Route>
            <HomePage />
          </Route>
        </Switch>
      </main>
      
      {/* Persistent footer carrying social channels and capsule dispatches */}
      <Footer />
    </div>
  );
}