<template>
    <v-card>
        <v-toolbar color="primary">
            <v-toolbar-title>Action</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn icon @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-card-title class="headline">Do the following...</v-card-title>
        <v-card-text>
            <v-form v-model="valid" ref="form">
                <v-container class="ma-0 pa-0" fluid>
                    <v-row no-gutters>
                        <v-col cols="12">
                            <v-select label="Select an action..." v-model="selectedAction" :items="recipeActions" dense outlined rounded return-object></v-select>
                            <div v-if="selectedAction.value == 'gear'">
                                <v-select label="Select a gear..." v-model="selectedGear" item-value="id" item-text="name" :items="gears" dense outlined rounded return-object></v-select>
                            </div>
                            <div v-else-if="actionIsDescription">
                                <v-textarea label="Description..." v-model="valueInput" height="160" :rules="[recipeRules.required]" :maxlength="$store.state.recipeMaxLength.actionValue" dense outlined></v-textarea>
                            </div>
                            <div v-else-if="selectedAction.value && selectedAction.value != 'commute'">
                                <v-text-field v-model="valueInput" :label="selectedAction.text" :rules="actionRules" :maxlength="$store.state.recipeMaxLength.actionValue" dense outlined rounded></v-text-field>
                            </div>
                            <div class="action-activity-tags" v-if="actionIsText">
                                <h3 class="mb-2">Activity tags</h3>
                                <v-chip @click="addTag('distance')" small>Distance</v-chip>
                                <v-chip @click="addTag('speedAvg')" small>Avg speed</v-chip>
                                <v-chip @click="addTag('speedMax')" small>Max speed</v-chip>
                                <v-chip @click="addTag('cadenceAvg')" small>Avg cadence</v-chip>
                                <v-chip @click="addTag('wattsAvg')" small>Avg watts</v-chip>
                                <v-chip @click="addTag('wattsMax')" small>Max watts</v-chip>
                                <v-chip @click="addTag('hrAvg')" small>Avg HR</v-chip>
                                <v-chip @click="addTag('hrMax')" small>Max HR</v-chip>
                                <v-chip @click="addTag('calories')" small>Calories</v-chip>
                                <v-chip @click="addTag('elevationGain')" small>Elevation gain</v-chip>
                                <v-chip @click="addTag('elevationMax')" small>Max elevation</v-chip>
                                <v-chip @click="addTag('dateStart')" small>Start time</v-chip>
                                <v-chip @click="addTag('dateEnd')" small>End time</v-chip>
                                <v-chip @click="addTag('totalTime')" small>Total time</v-chip>
                                <v-chip @click="addTag('movingTime')" small>Moving time</v-chip>
                                <v-chip @click="addTag('device')" small>GPS device</v-chip>
                                <h3 class="mt-3 mb-2">Weather tags</h3>
                                <v-chip @click="addTag('weather.icon')" small>Icon</v-chip>
                                <v-chip @click="addTag('weather.summary')" small>Summary</v-chip>
                                <v-chip @click="addTag('weather.temperature')" small>Temperature</v-chip>
                                <v-chip @click="addTag('weather.humidity')" small>Humidity</v-chip>
                                <v-chip @click="addTag('weather.pressure')" small>Pressure</v-chip>
                                <v-chip @click="addTag('weather.windSpeed')" small>Wind speed</v-chip>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="mt-4 text-center" cols="12">
                            <v-btn color="primary" @click="save" title="Save this action" :disabled="!selectedAction.value" rounded>
                                <v-icon left>mdi-check</v-icon>
                                Save action
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<style>
.action-activity-tags .v-chip {
    margin: 1px 2px 10px -1px;
}
</style>

<script>
import _ from "lodash"
import userMixin from "~/mixins/userMixin.js"
import recipeMixin from "~/mixins/recipeMixin.js"

export default {
    mixins: [userMixin, recipeMixin],
    props: ["disabled-actions"],
    data() {
        return this.initialData()
    },
    computed: {
        actionRules() {
            if (this.selectedAction.value == "webhook") {
                return [this.recipeRules.required, this.recipeRules.url]
            }
            return [this.recipeRules.required]
        },
        actionIsDescription() {
            return this.selectedAction.value == "description" || this.selectedAction.value == "prependDescription" || this.selectedAction.value == "appendDescription"
        },
        actionIsText() {
            return ["name", "prependName", "appendName", "description", "prependDescription", "appendDescription"].indexOf(this.selectedAction.value) >= 0
        }
    },
    watch: {
        disabledActions(arr) {
            this.filterActions(arr)
        }
    },
    methods: {
        initialData(filter) {
            let recipeActions = this.filterActions(this.disabledActions)

            // Get bikes and shoes and create gears list.
            const bikes = _.cloneDeep(this.$store.state.user.profile.bikes)
            for (let bike of bikes) {
                bike.name = `${bike.name} (bike)`
            }
            const shoes = _.cloneDeep(this.$store.state.user.profile.shoes)
            for (let shoe of shoes) {
                shoe.name = `${shoe.name} (shoes)`
            }
            const gears = _.concat(bikes, shoes)

            // User has no gears? Force disable the "Set gear" action.
            if (gears.length == 0) {
                _.remove(recipeActions, {value: "gear"})
            }

            return {
                action: {},
                loading: false,
                valid: true,
                recipeActions: recipeActions,
                selectedAction: {},
                gears: gears,
                selectedGear: {},
                valueInput: ""
            }
        },
        filterActions(arr) {
            const recipeActions = _.cloneDeep(this.$store.state.recipeActions)
            arr = _.cloneDeep(arr)

            // Make sure we disable related actions that were already set.
            if (arr.indexOf("name") >= 0) {
                arr.push("prependName")
                arr.push("appendName")
            }
            if (arr.indexOf("prependName") >= 0) {
                arr.push("name")
                arr.push("appendName")
            }
            if (arr.indexOf("appendName") >= 0) {
                arr.push("name")
                arr.push("prependName")
            }
            if (arr.indexOf("description") >= 0) {
                arr.push("prependDescription")
                arr.push("appendDescription")
            }
            if (arr.indexOf("prependDescription") >= 0) {
                arr.push("description")
                arr.push("appendDescription")
            }
            if (arr.indexOf("appendDescription") >= 0) {
                arr.push("description")
                arr.push("prependDescription")
            }

            arr = _.uniq(arr)

            // Iterate actions already set for the current automation recipe.
            for (let existingAction of arr) {
                const item = _.find(recipeActions, {value: existingAction})
                item.disabled = true
            }

            // User has no gears? Force disable the "Set gear" action.
            if (this.gears && this.gears.length == 0) {
                _.remove(recipeActions, {value: "gear"})
            }

            // Webhook is enabled only on PRO accounts.
            if (!this.$store.state.user.isPro) {
                const webhook = _.find(recipeActions, {value: "webhook"})
                webhook.disabled = true
                webhook.text += " (PRO only)"
            }

            this.recipeActions = recipeActions
            return recipeActions
        },
        cancel() {
            this.$emit("closed", false)
            const reset = () => Object.assign(this.$data, this.initialData())
            setTimeout(reset, 500)
        },
        save() {
            if (this.$refs.form.validate()) {
                const result = {
                    type: this.selectedAction.value
                }

                if (result.type == "gear") {
                    result.value = this.selectedGear.id
                    result.friendlyValue = this.selectedGear.name
                } else {
                    result.value = this.valueInput || true
                }

                this.$emit("closed", result)
                Object.assign(this.$data, this.initialData())
            }
        },
        addTag(tag) {
            this.valueInput += "${" + tag + "} "
        }
    }
}
</script>
