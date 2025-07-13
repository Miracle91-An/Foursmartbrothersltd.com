document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        subject: form.subject.value,
        message: form.message.value,
        created_at: new Date().toISOString()
    };
    
    try {
        // Insert into Supabase
        const { data, error } = await supabase
            .from('contacts')
            .insert([formData]);
        
        if (error) throw error;
        
        // Send email notification
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: 'YOUR_EMAILJS_SERVICE_ID',
                template_id: 'YOUR_EMAILJS_TEMPLATE_ID',
                user_id: 'YOUR_EMAILJS_USER_ID',
                template_params: {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: `New Contact Form Submission: ${formData.subject}`,
                    message: formData.message,
                    to_email: 'miracleaneke91@gmail.com'
                }
            })
        });
        
        alert('Your message has been sent successfully!');
        form.reset();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error sending your message. Please try again later.');
    }
});