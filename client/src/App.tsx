import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Order from "@/pages/order";
import Kitchen from "@/pages/kitchen";
import NotFound from "@/pages/not-found";
import Analytics from "@/pages/analytics";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/menu" component={Menu} />
        <Route path="/order" component={Order} />
        <Route path="/kitchen" component={Kitchen} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;