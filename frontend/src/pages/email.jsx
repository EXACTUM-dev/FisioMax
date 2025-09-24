/**
 * @fileoverview Vista para envio de correos
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React, { useState } from 'react';

export default function ContactForm() {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState({ mensaje: '', tipo: '' });

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultado({ mensaje: '', tipo: '' });

    try {
      const response = await fetch('http://localhost:5000/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setResultado({
          mensaje: '✅ Mensaje enviado correctamente',
          tipo: 'success'
        });
        // Limpiar formulario
        setFormData({
          nombre: '',
          email: '',
          mensaje: ''
        });
      } else {
        setResultado({
          mensaje: `❌ ${data.message || 'Error al enviar el mensaje'}`,
          tipo: 'error'
        });
      }
    } catch (error) {
      setResultado({
        mensaje: '❌ Error de conexión. Intenta nuevamente.',
        tipo: 'error'
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.contactSection}>
          <div style={styles.contactForm}>
            <h2>📧 Contáctame</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label htmlFor="nombre" style={styles.label}>Nombre:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="mensaje" style={styles.label}>Mensaje:</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="5"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  required
                  placeholder="Escribe tu mensaje aquí..."
                  style={{...styles.input, ...styles.textarea}}
                />
              </div>
              
              <button
                type="submit" 
                disabled={isSubmitting}
                style={{
                  ...styles.button,
                  ...(isSubmitting ? styles.buttonDisabled : {}),
                  ...(isSubmitting ? {} : styles.buttonHover)
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = '#d8345f';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = '#e94560';
                  }
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
            
            {resultado.mensaje && (
              <div 
                style={{
                  ...styles.mensajeResultado,
                  ...(resultado.tipo === 'success' ? styles.success : styles.error)
                }}
              >
                {resultado.mensaje}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos convertidos a objeto JavaScript
const styles = {
  body: {
    background: '#1a1a2e',
    color: 'white',
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    margin: 0
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  contactSection: {
    margin: '2rem 0'
  },
  contactForm: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    background: '#16213e',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  formGroup: {
    marginBottom: '1.5rem',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#e94560'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: '#0f3460',
    border: '1px solid #1a1a2e',
    color: 'white',
    borderRadius: '5px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '120px'
  },
  button: {
    background: '#e94560',
    color: 'white',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background 0.3s'
  },
  buttonHover: {
    ':hover': {
      background: '#d8345f'
    }
  },
  buttonDisabled: {
    background: '#6c757d',
    cursor: 'not-allowed'
  },
  mensajeResultado: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '5px',
    fontWeight: 'bold'
  },
  success: {
    background: '#155724',
    color: '#d4edda',
    border: '1px solid #c3e6cb'
  },
  error: {
    background: '#721c24',
    color: '#f8d7da',
    border: '1px solid #f5c6cb'
  }
};