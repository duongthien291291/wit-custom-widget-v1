import { render } from 'preact';
import { App } from './components/App';
import './styles/base.scss';
import './styles/components.scss';

// Import GridStack CSS
import 'gridstack/dist/gridstack.min.css';

render(<App />, document.getElementById('app')!);
