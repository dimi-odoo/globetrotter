'use client';

import { useEffect } from 'react';

export default function Chatbot() {
  useEffect(() => {
    // Only initialize once
    if (document.querySelector('.n8n-chat') || document.querySelector('.fallback-chat')) {
      return;
    }

    const initializeChatbot = () => {
      try {
        // Load the n8n chat CSS
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Load and initialize the n8n chat script
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          try {
            const { createChat } = await import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');

            createChat({
              webhookUrl: 'https://laksh039.app.n8n.cloud/webhook/5f1c0c82-0ff9-40c7-9e2e-b1a96ffe24cd/chat',
              initialMessages: ['Hello! 👋 I\\'m your travel assistant. How can I help you plan your next adventure?'],
              i18n: {
                en: {
                  title: 'Travel Assistant',
                  subtitle: 'Ask me anything about travel!',
                  footer: 'Powered by Globetrotter',
                  getStarted: 'Get Started',
                  inputPlaceholder: 'Type your message...',
                }
              },
              theme: {
                primaryColor: '#3b82f6',
              }
            });
          } catch (error) {
            console.warn('Chatbot failed to load, creating fallback:', error.message);
            
            // Create fallback button
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'fallback-chat';
            fallbackContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
            
            const fallbackButton = document.createElement('button');
            fallbackButton.innerHTML = '💬';
            fallbackButton.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;';
            
            fallbackButton.addEventListener('mouseover', () => {
              fallbackButton.style.transform = 'scale(1.1)';
              fallbackButton.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            });
            
            fallbackButton.addEventListener('mouseout', () => {
              fallbackButton.style.transform = 'scale(1)';
              fallbackButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            });
            
            fallbackButton.addEventListener('click', () => {
              alert('Chat service is temporarily unavailable. Please try again later or contact support.');
            });
            
            fallbackContainer.appendChild(fallbackButton);
            document.body.appendChild(fallbackContainer);
          }
        `;
        
        document.body.appendChild(script);

      } catch (err) {
        console.error('Error initializing chatbot:', err);
      }
    };

    // Initialize after page load
    if (document.readyState === 'complete') {
      initializeChatbot();
    } else {
      window.addEventListener('load', initializeChatbot);
    }

  }, []);

  return (
    <>
      <style jsx global>{`
        .n8n-chat {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 1000 !important;
          font-family: inherit !important;
        }
        
        .n8n-chat-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
          border-radius: 50% !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
          transition: all 0.3s ease !important;
          width: 60px !important;
          height: 60px !important;
          border: none !important;
          cursor: pointer !important;
        }
        
        .n8n-chat-button:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
        }
        
        .n8n-chat-window {
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid #e5e7eb !important;
          overflow: hidden !important;
          background: white !important;
          max-width: 400px !important;
          max-height: 600px !important;
          width: 400px !important;
          height: 600px !important;
        }
        
        .n8n-chat-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
          color: white !important;
          padding: 16px !important;
          font-weight: 600 !important;
        }
        
        .n8n-chat-message {
          border-radius: 12px !important;
          margin: 8px 0 !important;
          padding: 12px 16px !important;
          max-width: 80% !important;
          word-wrap: break-word !important;
        }
        
        .n8n-chat-message-user {
          background: #3b82f6 !important;
          color: white !important;
          margin-left: auto !important;
        }
        
        .n8n-chat-message-bot {
          background: #f3f4f6 !important;
          color: #374151 !important;
          margin-right: auto !important;
        }
        
        .n8n-chat-messages {
          padding: 16px !important;
          height: 400px !important;
          overflow-y: auto !important;
        }
        
        .n8n-chat-input-container {
          padding: 16px !important;
          border-top: 1px solid #e5e7eb !important;
          background: white !important;
        }
        
        .n8n-chat-input {
          border: 1px solid #d1d5db !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          width: 100% !important;
          resize: none !important;
          font-family: inherit !important;
        }
        
        .n8n-chat-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none !important;
        }
        
        .n8n-chat-send-button {
          background: #3b82f6 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          transition: all 0.2s ease !important;
          border: none !important;
          color: white !important;
          cursor: pointer !important;
          margin-left: 8px !important;
        }
        
        .n8n-chat-send-button:hover {
          background: #1d4ed8 !important;
        }
        
        @media (max-width: 640px) {
          .n8n-chat, .fallback-chat {
            bottom: 16px !important;
            right: 16px !important;
          }
          
          .n8n-chat-button {
            width: 50px !important;
            height: 50px !important;
          }
          
          .n8n-chat-window {
            width: calc(100vw - 32px) !important;
            height: calc(100vh - 100px) !important;
            max-width: none !important;
            max-height: none !important;
            bottom: 80px !important;
            right: 16px !important;
          }
          
          .n8n-chat-messages {
            height: calc(100vh - 250px) !important;
          }
        }
        
        .n8n-chat-window {
          animation: slideInUp 0.3s ease-out !important;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
