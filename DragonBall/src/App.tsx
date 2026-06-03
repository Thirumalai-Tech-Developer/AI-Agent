import React from 'react';
import { Route, Switch } from 'wouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CharactersPage from './pages/CharactersPage';
import LorePage from './pages/LorePage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Persistent Navigation Bar */}
      <Navbar />

      {/* Main Content Area with Routing Context */}
      <main className="flex-grow w-full mx-auto flex flex-col">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/characters" component={CharactersPage} />
          <Route path="/lore" component={LorePage} />
          
          {/* Fallback 404 Route */}
          <Route>
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-primary">
                404 - Page Not Found
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                The pathway you are attempting to traverse does not exist. Return back to safety to continue your journey.
              </p>
              <a 
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Return Home
              </a>
            </div>
          </Route>
        </Switch>
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}