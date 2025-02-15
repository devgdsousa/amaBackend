import { createCadastroValidator, updateCastroValidator } from '#validators/cadastro'
import type { HttpContext } from '@adonisjs/core/http'
import Cadastro from '#models/cadastro'

export default class CadastrosController {
  // Listar todos os cadastros do usuário autenticado
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      await user.preload('cadastros')

      return response.ok(user.cadastros)
    } catch (error) {
      console.log('Erro ao listar cadastros:', error) // Relata o erro no console
      return response.internalServerError({ message: 'Erro ao listar cadastros', error })
    }
  }

  // Criar um novo cadastro
  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCadastroValidator)
      const user = auth.user!

      const cadastro = await user.related('cadastros').create(data)

      return response.created({ message: 'Cadastro criado com sucesso', cadastro })
    } catch (error) {
      console.log('Erro ao criar cadastro:', error) // Relata o erro no console
      return response.badRequest({ message: 'Erro ao criar cadastro', error })
    }
  }

  // Exibir um cadastro específico
  async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const cadastro = await Cadastro.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .first()

      if (!cadastro) {
        return response.notFound({ message: 'Cadastro não encontrado' })
      }

      return response.ok(cadastro)
    } catch (error) {
      console.log('Erro ao buscar cadastro:', error) // Relata o erro no console
      return response.internalServerError({ message: 'Erro ao buscar cadastro', error })
    }
  }

  // Atualizar um cadastro específico
  async update({ params, request, response }: HttpContext) {
    try {
      const cadastro = await Cadastro.findByOrFail('id', params.id)
      const cadastroData = await request.validateUsing(updateCastroValidator)

      // Atualiza o cadastro com os novos dados
      cadastro.merge(cadastroData)
      await cadastro.save()

      return response.ok({ message: 'Cadastro atualizado com sucesso', cadastro })
    } catch (error) {
      console.log('Erro ao atualizar cadastro:', error) // Relata o erro no console
      return response
        .status(400)
        .json({ error: 'Erro ao atualizar cadastro', details: error.messages })
    }
  }

  // Deletar um cadastro específico
  async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const cadastro = await Cadastro.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .first()

      if (!cadastro) {
        return response.notFound({ message: 'Cadastro não encontrado' })
      }

      await cadastro.delete()
      return response.noContent()
    } catch (error) {
      console.log('Erro ao excluir cadastro:', error) // Relata o erro no console
      return response.internalServerError({ message: 'Erro ao excluir cadastro', error })
    }
  }
}
