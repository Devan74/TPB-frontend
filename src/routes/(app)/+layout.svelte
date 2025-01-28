<script>
    import Header from '$lib/Header.svelte';    
    import { Toasts } from 'as-toast';
    import Footer from '$lib/Footer.svelte';
</script>

<Header />
<slot /> 
<Toasts />
<Footer />