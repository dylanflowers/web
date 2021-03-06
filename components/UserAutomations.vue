<template>
    <div>
        <v-card class="mb-5" v-for="recipe in recipes" :key="recipe.id" outlined>
            <v-hover v-slot:default="{hover}">
                <n-link :to="'/automations/edit?id=' + recipe.id" :title="recipe.title">
                    <v-card-title class="accent">
                        <v-icon class="ml-n1 mr-2" color="primary" v-if="recipe.defaultFor">{{ getSportIcon(recipe.defaultFor) }}</v-icon>
                        <span class="primary--text">{{ recipe.title }}</span>
                        <v-spacer />
                        <v-icon v-show="hover" small>mdi-pencil-outline</v-icon>
                    </v-card-title>
                </n-link>
            </v-hover>
            <v-card-text class="white--text pb-1 pb-md-2">
                <ul class="mt-0 pl-4 condition-list">
                    <li v-if="recipe.defaultFor">Default automation for all "{{ getSportName(recipe.defaultFor) }}" activities</li>
                    <li v-for="condition in recipe.conditions">
                        {{ conditionSummary(condition) }}
                    </li>
                </ul>
                <ul class="mt-1 pl-4 action-list">
                    <li class="font-weight-medium" v-for="action in recipe.actions">
                        {{ actionSummary(action) }}
                    </li>
                </ul>
                <div class="mt-2 float-left" v-if="recipeStats[recipe.id]">
                    <v-chip class="mb-0 ml-1" disabled outlined small>Executed {{ recipeStats[recipe.id].activities.length }} times, last: {{ recipeStats[recipe.id].dateLastTrigger }}</v-chip>
                </div>
                <div class="text-right mr-n1 nowrap">
                    <template v-if="recipe.defaultFor">
                        <v-chip class="text-lowercase" small outlined>default for {{ getSportName(recipe.defaultFor) }}</v-chip>
                    </template>
                    <template v-else>
                        <v-btn color="grey lighten-1" title="Send this automation down (executes last)" class="mr-1" @click="setRecipeOrder(recipe, 1)" icon>
                            <v-icon>mdi-arrow-down-circle</v-icon>
                        </v-btn>
                        <v-btn color="grey lighten-1" title="Send this automation up (executes first)" class="mr-n1" @click="setRecipeOrder(recipe, -1)" icon>
                            <v-icon>mdi-arrow-up-circle</v-icon>
                        </v-btn>
                    </template>
                </div>
            </v-card-text>
        </v-card>
        <div class="mt-5 text-center text-md-left">
            <v-btn v-if="!needsProRecipes" color="primary" to="/automations/edit" title="Create a new automation" rounded nuxt>
                <v-icon left>mdi-plus-circle</v-icon>
                Create new automation
            </v-btn>
            <div v-else>
                <v-alert border="top" color="primary" colored-border>
                    <p>
                        You have reached the limit of {{ $store.state.freePlanDetails.maxRecipes }} automations on your free account.
                        <br v-if="$breakpoint.mdAndUp" />
                        To have unlimited automations and access to all the features, you'll need a PRO account.
                    </p>
                    <v-btn color="primary" to="/billing" title="Subscribe to get a PRO account!" rounded nuxt>
                        <v-icon left>mdi-credit-card</v-icon>
                        Subscribe to PRO
                    </v-btn>
                </v-alert>
            </div>
        </div>
    </div>
</template>

<style>
.action-list {
    list-style-type: disc;
}
.condition-list {
    list-style-type: circle;
}
</style>

<script>
import _ from "lodash"
import userMixin from "~/mixins/userMixin.js"
import recipeMixin from "~/mixins/recipeMixin.js"

export default {
    authenticated: true,
    mixins: [userMixin, recipeMixin],
    data() {
        return {
            hasChanges: false,
            recipeStats: {},
            recipes: []
        }
    },
    async fetch() {
        try {
            const recipeStats = {}
            const arrStats = await this.$axios.$get(`/api/users/${this.user.id}/recipes/stats`)
            for (let stats of arrStats) {
                const recipeId = stats.id.split("-")[1]
                stats.dateLastTrigger = this.$moment(stats.dateLastTrigger).format("ll")
                recipeStats[recipeId] = stats
            }

            this.recipeStats = recipeStats
        } catch (ex) {
            this.$webError("UserAutomations.fetch", ex)
        }
    },
    created() {
        this.delaySaveOrder = _.debounce(this.saveOrder, 4000)
    },
    mounted() {
        this.reorderRecipes(_.cloneDeep(Object.values(this.user.recipes)))
    },
    methods: {
        reorderRecipes(recipes) {
            if (!recipes) recipes = this.recipes
            this.recipes = _.sortBy(recipes, ["defaultFor", "order", "title"])
        },
        setRecipeOrder(recipe, offset) {
            const index = _.indexOf(this.recipes, recipe)
            const neighbour = this.recipes[index + offset]

            // Make sure ordering will only change inside the bounds.
            if (neighbour && !neighbour.defaultFor) {
                if (offset < 0 && neighbour.order >= 0) {
                    this.recipes[index + offset].order++
                    recipe.order--
                } else if (offset > 0) {
                    this.recipes[index + offset].order--
                    recipe.order++
                }
            }

            this.hasChanges = true
            this.reorderRecipes()
            this.delaySaveOrder()
        },
        async saveOrder() {
            if (!this.hasChanges) return
            this.hasChanges = false

            try {
                const data = {}

                // Create object to update the order of recipes.
                for (let recipe of this.recipes) {
                    data[recipe.id] = recipe.order
                    this.$store.commit("setUserRecipe", _.cloneDeep(recipe))
                }

                await this.$axios.$post(`/api/users/${this.user.id}/recipes/order`, data)
            } catch (ex) {
                this.$webError("UserAutomations.saveOrder", ex)
            }
        }
    }
}
</script>
