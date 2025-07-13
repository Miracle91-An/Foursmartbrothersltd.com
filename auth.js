// Initialize Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const supabaseUrlL= 'https://eopsamjtrupenuxsmahh.supabase.co';
const sUPABASEKEY= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcHNhbWp0cnVwZW51eHNtYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTkyMTgsImV4cCI6MjA2Njg3NTIxOH0.jBR9oNuDqB9DVQ_-Zl02DLfX62KYmocxtwi5cMJGvoQ';


// Sign Up Form Submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const fullname = form.fullname.value;
    const phone = form.phone.value;
    
    // Validate password match
    if (form.password.value !== form.confirmPassword.value) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        // Sign up with Supabase
        const { user, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        // Add user to profiles table
        const { data, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: user.id, 
                    email, 
                    full_name: fullname, 
                    phone 
                }
            ]);
        
        if (profileError) throw profileError;
        
        alert('Sign up successful! Please check your email for verification.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Sign up error:', error.message);
        alert('Sign up failed: ' + error.message);
    }
});

// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    
    try {
        const { user, error } = await supabase.auth.signIn({
            email,
            password
        });
        
        if (error) throw error;
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to dashboard or previous page
        const redirectTo = localStorage.getItem('redirectTo') || 'index.html';
        window.location.href = redirectTo;
    } catch (error) {
        console.error('Login error:', error.message);
        alert('Login failed: ' + error.message);
    }
});

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtons = document.querySelector('.auth-buttons');
    
    if (user) {
        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">Dashboard</a>
            <a href="#" id="logoutBtn" class="btn btn-secondary">Logout</a>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', checkAuth);