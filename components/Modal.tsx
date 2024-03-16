"use client"

import { addUserEmailToProduct } from '@/lib/action';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment, useState, FormEvent } from 'react'

interface Props{
  productId : string
}
const Modal = ({productId} : Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  
  const closeModal = () => {
    setIsOpen(false);
  }

  const openModal = () => {
    setIsOpen(true);
  }

  const handleSubmit = async (event : FormEvent<HTMLFormElement> ) => {
    event.preventDefault();

    setIsSubmitting(true);

    await addUserEmailToProduct(productId, email );
    setIsSubmitting(false)
    setEmail('');
    closeModal();
    

  }

  return ( 
    <>
      <button type="button" onClick={openModal} className='dialog-btn'>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className='flex justify-between items-center mb-2'>
                    <div className='p-3 border border-gray-200 rounded-10'>
                      <Image  
                        src="/assets/icons/logo.svg"
                        width={28}
                        height={28}
                        alt='logo'
                        
                      />
                    </div>
                    <div>
                      <button type='button'onClick={closeModal}>
                        <Image 
                          src="/assets/icons/x-close.svg"
                          alt='close'
                          width={24}
                          height={24}
                          className='cursor-pointer'
                        />
                      </button>
                    </div>
                  </div>

                  <Dialog.Title
                    as="h4"
                    className="dialog-head_text"
                  >
                    Stay updated with product pricing alerts right in your inbox!
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-500">
                    Never miss a bargain again with our timely alerts!
                  </p>
                  

                  <form className='flex flex-col mt-5' onSubmit={handleSubmit}>
                    <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                      Email address
                    </label>
                    <div className='flex gap-2 px-5 py-3 border border-gray-300 rounded-[50px] mt-3'>
                      <Image 
                        src="/assets/icons/mail.svg"
                        height={18}
                        width={18}
                        alt='mail'
                      />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value)}} 
                        className='dialog-input'
                        placeholder='Enter your email address'
                        required
                      />
                    </div>
                    <button type='submit' className=' w-full text-white bg-secondary font-bold rounded-lg mt-8 py-3 px-2'>
                      {isSubmitting ? "Submitting..." : "Track"}
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Modal