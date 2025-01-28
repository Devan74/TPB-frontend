<script>
  import { Navbar, NavBrand, NavLi, NavUl } from "flowbite-svelte";
  import { goto } from "$app/navigation";

  const logout = () => {
    localStorage.removeItem("token");
    goto("/login");
  };
</script>

<header class="bg-[#3e6380] border-b sticky top-0 z-10">
  <Navbar>
    <!-- Brand -->
    <NavBrand href="/">
      <img
        src="/img/fidelity_logo.jpeg"
        class="mr-3 h-6 sm:h-9"
        alt="Fidelity National Financial Logo"
      />
    </NavBrand>

    <NavUl>
      <NavLi href="/template-management" activeClass="text-indigo-500">
        Template Management
      </NavLi>
      <NavLi
        on:click={logout}
        activeClass="text-indigo-500"
        class="cursor-pointer"
      >
        Logout
      </NavLi>
    </NavUl>
  </Navbar>
</header>
