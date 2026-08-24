// third party
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from './contexts/ConfigContext';
import { ConfigProvider as AntConfigProvider } from 'antd';

// project imports
import App from './App';
import reportWebVitals from './reportWebVitals';

// style + assets
import './index.scss';
import './global-page.scss';
import 'antd/dist/reset.css';
// Suppress warnings in development mode
if (process.env.NODE_ENV === "development") {
  console.warn = () => {};
  console.error = () => {}; // Also suppress errors if needed
}

// -----------------------|| REACT DOM RENDER  ||-----------------------//

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ConfigProvider>
     <AntConfigProvider
      theme={{
        token: {
          colorPrimary: '#088B46',
          borderRadius: 8,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          colorLink: '#088B46',
          colorLinkHover: '#066e37',
        },
      }}
    >
    <App />
    </AntConfigProvider>
  </ConfigProvider>
);

reportWebVitals();
