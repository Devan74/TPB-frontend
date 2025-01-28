import { writable } from 'svelte/store';
import { browser } from '$app/environment';

  
export const session_values = writable(
    browser && (JSON.parse(localStorage.getItem("session_values")) || "")
 );

 export const login_session_values = writable(
    browser && (JSON.parse(localStorage.getItem("login_session_values")) || "")
 );


 

