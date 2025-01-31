<script>
  import { onMount } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { goto } from '$app/navigation';
  import axios from 'axios';

  let isLoading = false;
  let errorMessage = '';

  export let data;

  let formName = '';
  let fields = [];
  let formStatus = 'active';
  let selectedType = '';
  let formId;

  const fieldTypes = {
    input: { icon: '📝', label: 'Text Input' },
    textarea: { icon: '📋', label: 'Textarea' },
    checkbox: { icon: '☑️', label: 'Checkbox' },
    radio: { icon: '⭕', label: 'Radio' },
    dropdown: { icon: '🔽', label: 'Dropdown' },
    date: { icon: '📅', label: 'Date' },
    time: { icon: '🕒', label: 'Time' },
    number: { icon: '🔢', label: 'Number' },
    email: { icon: '📧', label: 'Email' },
    tel: { icon: '📞', label: 'Telephone' },
    divider: { icon: '➖', label: 'Divider' },
    title: { icon: 'Ab', label: 'Title' },
  };

  onMount(() => {
    console.log('Form data:', data);
    if (data.form) {
      formId = data.form._id;
      formName = data.form.formName || '';
      formStatus = data.form.status || 'inactive';
      selectedType = data.form.type || '';
      fields = data.form.fields.map(field => ({
        ...field,
        id: `${field.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        validation: {
          required: field.validation?.required || false,
          minLength: field.validation?.minLength || null,
          maxLength: field.validation?.maxLength || null,
          min: field.validation?.min || null,
          max: field.validation?.max || null,
          pattern: field.validation?.pattern || null,
        },
        advanced: {
          readonly: field.advanced?.readonly || false,
          disabled: field.advanced?.disabled || false,
          customClasses: field.advanced?.customClasses || '',
        },
      })) || [];
    } else {
      console.error('No form data available');
    }
  });

  function handleDndConsider(e) {
    fields = e.detail.items;
  }

  function handleDndFinalize(e) {
    fields = e.detail.items;
  }

  function handleDrop(e) {
    e.preventDefault();
    const fieldType = e.dataTransfer?.getData('text/plain');
    if (fieldType && fieldTypes[fieldType]) {
      addField(fieldType);
    }
  }

  function addField(fieldType) {
    const newField = {
      id: `${fieldType}-${Date.now()}`,
      type: fieldType,
      properties: {
        label: `${fieldTypes[fieldType].label} ${fields.length + 1}`,
        name: `${fieldType}-${fields.length + 1}`,
      },
      attributes: {
        type: fieldType === 'input' ? 'text' : fieldType,
        placeholder: `Enter ${fieldTypes[fieldType].label.toLowerCase()}`,
      },
      options: ['dropdown', 'radio', 'checkbox'].includes(fieldType) ? [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ] : undefined,
      layout: ['radio', 'checkbox'].includes(fieldType) ? { inline: false } : undefined,
      validation: {
        required: false,
        minLength: null,
        maxLength: null,
        min: null,
        max: null,
        pattern: null,
      },
      advanced: {
        readonly: false,
        disabled: false,
        customClasses: '',
      },
    };
    fields = [...fields, newField];
  }

  function updateField(fieldId, path, value) {
    fields = fields.map(field => {
      if (field.id === fieldId) {
        const updatedField = { ...field };
        const parts = path.split('.');
        let current = updatedField;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        
        return updatedField;
      }
      return field;
    });
  }

  function addOption(fieldId) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const options = [...(field.options || [])];
      const newOption = {
        label: `Option ${options.length + 1}`,
        value: `${options.length + 1}`
      };
      options.push(newOption);
      updateField(fieldId, 'options', options);
    }
  }

  function removeOption(fieldId, index) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const options = [...field.options];
      options.splice(index, 1);
      updateField(fieldId, 'options', options);
    }
  }

  function removeField(fieldId) {
    fields = fields.filter(f => f.id !== fieldId);
  }

  function toggleFormStatus() {
    formStatus = formStatus === 'active' ? 'inactive' : 'active';
  }

  function updateValidation(fieldId, key, value) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const validation = { ...field.validation, [key]: value };
      updateField(fieldId, 'validation', validation);
    }
  }

  function updateAdvancedProperties(fieldId, key, value) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const advanced = { ...field.advanced, [key]: value };
      updateField(fieldId, 'advanced', advanced);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;
    errorMessage = '';
    const formData = {
      formName,
      fields: fields.map(({ id, ...field }) => field),
      status: formStatus,
      type: selectedType,
    };

    try {
      if (!formId) {
        throw new Error('Form ID is undefined');
      }
      const response = await fetch(`http://localhost:8000/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form updated successfully:', result);
        await goto('/template-management');
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to update form: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      errorMessage = `Error updating form: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }
</script>

{#if formId}
<form on:submit={handleSubmit}>
  <div class="bg-gray-50">
    <div class="flex">
      <!-- Left Sidebar - Form Fields -->
      <div class="w-64 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-r border-gray-300 overflow-y-auto shadow-md">
        <div class="p-4">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Form Fields
          </h2>
          <div class="grid grid-cols-2 gap-3">
            {#each Object.entries(fieldTypes) as [type, { icon, label }]}
              <div
                class="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white rounded-xl border border-gray-300 hover:border-indigo-500 hover:shadow-lg cursor-pointer transition-all duration-200"
                draggable="true"
                on:dragstart={e => e.dataTransfer.setData("text/plain", type)}
                on:click={() => addField(type)}
              >
                <span class="text-xl font-semibold text-indigo-600 mb-2">{icon}</span>
                <span class="text-sm font-medium text-gray-700">{label}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Form Name and Save Button -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <input
            type="text"
            bind:value={formName}
            class="text-xl font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            placeholder="Enter template name"
          />
          <!-- Form active or inactive -->
          <button
            type="button"
            class="px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 {
              formStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }"
            on:click={toggleFormStatus}
          >
            {formStatus === 'active' ? 'Active' : 'Inactive'}
          </button>
      
          <!-- Form Type Selection -->
          <select
            bind:value={selectedType}
            class="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Type</option>
            <option value="Doc Type">Doc Type</option>
            <option value="Sub Doc Type">Sub Doc Type</option>
          </select>
          <!-- Save Template -->
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      
        <!-- Form Builder Area -->
        <div class="flex-1 overflow-y-auto p-6">
          <div
            class="min-h-[calc(100vh-8rem)] border-2 border-dashed border-gray-300 rounded-lg p-6"
            on:dragover|preventDefault
            on:drop={handleDrop}
            use:dndzone={{items: fields}}
            on:consider={handleDndConsider}
            on:finalize={handleDndFinalize}
          >
            {#each fields as field (field.id)}
              <div
                animate:flip={{ duration: 300 }}
                class="mb-4 relative group"
              >
                <div class="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-red-500"
                    on:click={() => removeField(field.id)}
                  >
                    ×
                  </button>
                </div>
                <div class="bg-white rounded-lg border-2 p-4 border-gray-200">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-indigo-600">{fieldTypes[field.type].icon}</span>
                    <span class="font-medium">{field.properties.label}</span>
                  </div>
      
                  {#if field.type === 'input' || ['date', 'time', 'number', 'email', 'tel'].includes(field.type)}
                    <input
                      type={field.attributes.type || field.type}
                      placeholder={field.attributes.placeholder}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  {:else if field.type === 'textarea'}
                    <textarea
                      placeholder={field.attributes.placeholder}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    ></textarea>
                  {:else if field.type === 'dropdown'}
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      {#each field.options || [] as option}
                        <option value={option.value}>{option.label}</option>
                      {/each}
                    </select>
                  {:else if field.type === 'radio' || field.type === 'checkbox'}
                    <div class:flex={field.layout?.inline} class:gap-4={field.layout?.inline} class:space-y-2={!field.layout?.inline}>
                      {#each field.options || [] as option}
                        <label class="flex items-center gap-2">
                          <input
                            type={field.type}
                            name={field.properties.name}
                            value={option.value}
                          />
                          <span>{option.label}</span>
                        </label>
                      {/each}
                    </div>
                  {:else if field.type === 'divider'}
                    <hr class="my-2 border-t border-gray-300" />
                  {:else if field.type === 'title'}
                    <h3 class="text-lg font-semibold">{field.properties.label}</h3>
                  {/if}
                </div>
              </div>
            {/each}
            {#if fields.length === 0}
              <div class="text-center text-gray-500 py-12">
                Drag and drop fields here or click on a field type to add
              </div>
            {/if}
          </div>
        </div>
      </div>
      <!-- Right Sidebar - Properties -->
      <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
  <div class="p-6">
    <h2 class="text-lg font-semibold mb-6">Properties</h2>
    {#each fields as field (field.id)}
      <div class="space-y-6 mb-8">
        <h3 class="text-md font-semibold">{field.properties.label}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              bind:value={field.properties.name}
              on:input={() => updateField(field.id, 'properties.name', field.properties.name)}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              bind:value={field.properties.label}
              on:input={() => updateField(field.id, 'properties.label', field.properties.label)}
            />
          </div>
          
          {#if field.type === 'input' || field.type === 'textarea'}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                bind:value={field.attributes.placeholder}
                on:input={() => updateField(field.id, 'attributes.placeholder', field.attributes.placeholder)}
              />
            </div>
          {/if}
          
          {#if field.type === 'input'}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                bind:value={field.attributes.type}
                on:change={() => updateField(field.id, 'attributes.type', field.attributes.type)}
              >
                {#each ['text', 'number', 'email', 'tel', 'password', 'url', 'date', 'time', 'color'] as type}
                  <option value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                {/each}
              </select>
            </div>
          {/if}
          
          {#if ['dropdown', 'radio', 'checkbox'].includes(field.type)}
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <button
                  type="button"
                  class="text-sm text-indigo-600 hover:text-indigo-900"
                  on:click={() => addOption(field.id)}
                >
                  Add Option
                </button>
              </div>
              
              {#each field.options || [] as option, i}
                <div class="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Label"
                    bind:value={option.label}
                    on:input={() => updateField(field.id, `options.${i}.label`, option.label)}
                  />
                  <input
                    type="text"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Value"
                    bind:value={option.value}
                    on:input={() => updateField(field.id, `options.${i}.value`, option.value)}
                  />
                  <button
                    type="button"
                    class="text-gray-400 hover:text-red-500"
                    on:click={() => removeOption(field.id, i)}
                  >
                    ×
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          
          <!-- Validation Section -->
          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Validation</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  bind:checked={field.validation.required}
                  on:change={() => updateValidation(field.id, 'required', field.validation.required)}
                />
                <span class="text-sm text-gray-700">Required</span>
              </label>
              
              {#if ['input', 'textarea'].includes(field.type)}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Min Length
                  </label>
                  <input
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={field.validation.minLength}
                    on:input={() => updateValidation(field.id, 'minLength', field.validation.minLength)}
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Max Length
                  </label>
                  <input
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={field.validation.maxLength}
                    on:input={() => updateValidation(field.id, 'maxLength', field.validation.maxLength)}
                  />
                </div>
              {/if}
              
              {#if field.type === 'number' || (field.type === 'input' && field.attributes.type === 'number')}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={field.validation.min}
                    on:input={() => updateValidation(field.id, 'min', field.validation.min)}
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={field.validation.max}
                    on:input={() => updateValidation(field.id, 'max', field.validation.max)}
                  />
                </div>
              {/if}
              
              {#if field.type === 'email' || (field.type === 'input' && field.attributes.type === 'email')}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email Pattern
                  </label>
                  <input
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={field.validation.pattern}
                    on:input={() => updateValidation(field.id, 'pattern', field.validation.pattern)}
                    placeholder="e.g. [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                  />
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Advanced Properties Section -->
          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Advanced Properties</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  bind:checked={field.advanced.readonly}
                  on:change={() => updateAdvancedProperties(field.id, 'readonly', field.advanced.readonly)}
                />
                <span class="text-sm text-gray-700">Read Only</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  bind:checked={field.advanced.disabled}
                  on:change={() => updateAdvancedProperties(field.id, 'disabled', field.advanced.disabled)}
                />
                <span class="text-sm text-gray-700">Disabled</span>
              </label>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Custom CSS Classes
                </label>
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  bind:value={field.advanced.customClasses}
                  on:input={() => updateAdvancedProperties(field.id, 'customClasses', field.advanced.customClasses)}
                  placeholder="e.g. my-custom-class another-class"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
    </div>
  </div>
</form>
{:else}
  <p>Loading form data...</p>
{/if}

{#if errorMessage}
  <div class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
    {errorMessage}
  </div>
{/if}

<style>
  :global(*) {
    user-select: none;
  }
  
  input[type="text"],
  input[type="number"],
  select {
    user-select: text;
  }
</style>

