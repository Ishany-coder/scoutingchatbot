<script>
    import { useChat } from '@ai-sdk/svelte';
    
    const { input, handleSubmit, messages } = useChat({ maxSteps: 5 });
</script>

<main class="flex flex-col h-screen bg-gray-100 items-center justify-center">
    <div class="w-full max-w-2xl h-screen bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <!-- Chat messages container -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            {#each $messages as message}
                <div class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-xs md:max-w-md p-3 rounded-lg shadow-md
                        {message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}">
                        {message.content}
                    </div>
                </div>
            {/each}
        </div>
        
        <!-- Input field and send button -->
        <form on:submit={handleSubmit} class="p-4 bg-white shadow-md flex items-center gap-2">
            <input 
                type="text" 
                bind:value={$input} 
                class="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Type a message..." 
            />
            <button 
                type="submit" 
                class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Send
            </button>
        </form>
    </div>
</main>