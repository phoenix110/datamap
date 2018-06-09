import {expect} from 'chai';
import {mutations, actions} from 'src/assets/vuex/storage'

const {USER_LOGGED} = mutations

describe('mutations', () => {
    it('user logged', () => {
      // mock state
      const state = {}
      // apply mutation
      USER_LOGGED(state, {name: 'test',id: 1})
      // assert result
      expect(state.user.name).to.equal('test');
    })
})

describe('actions', () => {
    it('userLogged', () => {
        const commit = sinon.spy()
        const state = {}
        
        actions.userLogged({ commit, state }, {name: 'test',id: 1})
        
        expect(commit.args).to.deep.equal([
            ['USER_LOGGED', {name: 'test',id: 1}],
        ])
    })
})