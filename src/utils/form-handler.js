// Enhanced form submission handler with EmailJS integration
export const submitForm = async (formData, formSource = 'unknown') => {
  try {
    console.log('Submitting form with source:', formSource);
    
    // Add source to form data
    formData.append('source', formSource);
    formData.append('timestamp', new Date().toISOString());
    
    // Submit to Netlify form handler
    const netlifyResponse = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });
    
    if (!netlifyResponse.ok) {
      throw new Error(`Netlify submission failed: ${netlifyResponse.status}`);
    }
    
    console.log('Form submitted successfully to Netlify');
    
    // Also trigger our custom lead processor for EmailJS notifications
    try {
      const leadData = Object.fromEntries(formData.entries());
      const leadResponse = await fetch('/.netlify/functions/process-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      if (leadResponse.ok) {
        console.log('EmailJS notifications triggered successfully');
      } else {
        console.warn('EmailJS notification may have failed:', await leadResponse.text());
      }
    } catch (emailError) {
      console.warn('EmailJS notification error (form still submitted):', emailError);
    }
    
    return { success: true, message: 'Form submitted successfully' };
    
  } catch (error) {
    console.error('Form submission error:', error);
    return { success: false, message: error.message };
  }
};

// Global form submission handler for all forms
window.handleFormSubmission = async (event, source = 'unknown') => {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';
  
  try {
    const formData = new FormData(form);
    const result = await submitForm(formData, source);
    
    if (result.success) {
      // Redirect to success page
      window.location.href = '/success';
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Submission failed:', error);
    alert('There was an error submitting your form. Please try again or call us at (954) 937-9667.');
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
};